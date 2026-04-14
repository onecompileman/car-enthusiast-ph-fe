import { Component, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BuildMod } from '../../models/build/build-mod.model';
import { PhotoViewerImage } from '../../models/photo-viewer.model';
import {
  Build,
  BuildPerformanceMod,
  BuildPhotoType,
  BuildVisualMod,
} from '../../models/build/build.model';
import { Result } from '../../models/result.model';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { RejectReasonModalComponent } from '../reject-reason-modal/reject-reason-modal.component';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { BuildDataService } from '../../../core/data-services/build.data-service';
import { finalize, tap } from 'rxjs';
import Swal from 'sweetalert2';

interface ModGroup {
  group: string;
  mods: string[];
}

interface GroupFilter {
  key: string;
  label: string;
}

type BuildAngle = 'front' | 'side' | 'rear';

interface BuildHotspot {
  id: string;
  part: string;
  angle: BuildAngle;
  category: string;
  x: number;
  y: number;
  detail: string;
  price: string;
  source: string;
}

interface GalleryItem {
  title: string;
  image: string;
}

@Component({
  selector: 'cap-build-info',
  standalone: false,
  templateUrl: './build-info.component.html',
  styleUrl: './build-info.component.scss',
})
export class BuildInfoComponent {
  @Output() approveBuild = new EventEmitter<void>();
  @Output() rejectBuild = new EventEmitter<string>();

  readonly angles: ReadonlyArray<{ key: BuildAngle; label: string }> = [
    { key: 'front', label: 'Front Slant' },
    { key: 'side', label: 'Side View' },
    { key: 'rear', label: 'Rear Slant' },
  ];

  selectedAngle: BuildAngle = 'front';
  selectedPartFilter = 'all';
  selectedHotspotId = '';
  showHotspots = true;
  activePhoto: PhotoViewerImage | null = null;
  buildTitle = 'Build Info';
  ownerName = 'Builder';
  ownerHandle = '@builder';
  ownerLocation = 'Philippines';
  ownerMeta = 'Build details';
  ownerPhotoUrl: string | null = null;
  totalHearts = 0;
  totalFollows = 0;

  angleImageMap: Record<BuildAngle, string> = {
    front: '',
    side: '',
    rear: '',
  };
  imageLoaded = false;

  hotspots: BuildHotspot[] = [];

  gallery: GalleryItem[] = [];

  visualGroups: GroupFilter[] = [{ key: 'all', label: 'All' }];
  performanceGroups: GroupFilter[] = [{ key: 'all', label: 'All' }];
  private visualPartToGroup = new Map<string, string>();
  private perfPartToGroup = new Map<string, string>();

  buildTags: string[] = [];

  selectedVisualCategory = 'all';
  selectedPerformanceCategory = 'all';

  visualMods: BuildMod[] = [];
  performanceMods: BuildMod[] = [];

  isAdminPage = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private modalService: BsModalService,
    private buildDataService: BuildDataService,
  ) {}

  ngOnInit(): void {
    this.loadModTypes();
    const resolved = this.route.snapshot.data['build'] as Result<Build> | null;
    if (!resolved?.success || !resolved.data) {
      return;
    }
    this.applyResolvedBuild(resolved.data);

    this.isAdminPage = this.router.url.startsWith('/admin');
  }

  get totalBuildCost(): string {
    const amount =
      this.route.snapshot.data['build']?.data?.approxBuildCost ?? 0;
    if (amount >= 1_000_000) {
      return `PHP ${(amount / 1_000_000).toFixed(1)}M`;
    }
    return `PHP ${Math.round(amount / 1000)}K`;
  }

  get activeAngleLabel(): string {
    return (
      this.angles.find((item) => item.key === this.selectedAngle)?.label ||
      'Side View'
    );
  }

  get currentAngleImage(): string {
    return this.angleImageMap[this.selectedAngle];
  }

  get visibleHotspots(): BuildHotspot[] {
    return this.hotspots.filter(
      (hs) =>
        hs.angle === this.selectedAngle &&
        (this.selectedPartFilter === 'all' ||
          hs.category === this.selectedPartFilter),
    );
  }

  get selectedHotspot(): BuildHotspot | null {
    return (
      this.hotspots.find((item) => item.id === this.selectedHotspotId) || null
    );
  }

  get partCountMap(): Record<string, number> {
    const angleHotspots = this.hotspots.filter(
      (hs) => hs.angle === this.selectedAngle,
    );
    const result: Record<string, number> = { all: angleHotspots.length };
    for (const g of this.visualGroups) {
      if (g.key !== 'all') {
        result[g.key] = angleHotspots.filter(
          (hs) => hs.category === g.key,
        ).length;
      }
    }
    return result;
  }

  get filteredVisualMods(): BuildMod[] {
    if (this.selectedVisualCategory === 'all') return this.visualMods;
    return this.visualMods.filter(
      (mod) =>
        this.visualPartToGroup.get((mod.partType || '').toLowerCase()) ===
        this.selectedVisualCategory,
    );
  }

  get filteredPerformanceMods(): BuildMod[] {
    if (this.selectedPerformanceCategory === 'all') return this.performanceMods;
    return this.performanceMods.filter(
      (mod) =>
        this.perfPartToGroup.get((mod.partType || '').toLowerCase()) ===
        this.selectedPerformanceCategory,
    );
  }

  setAngle(angle: BuildAngle): void {
    this.selectedAngle = angle;
    this.selectedHotspotId = '';
    this.imageLoaded = false;
  }

  setPartFilter(filter: string): void {
    this.selectedPartFilter = filter;
    this.selectedHotspotId = '';
  }

  selectHotspot(id: string): void {
    this.selectedHotspotId = this.selectedHotspotId === id ? '' : id;
  }

  getHotspotPopoverContent(hotspot: BuildHotspot): string {
    return `Details: ${hotspot.detail}\nPrice: ${hotspot.price}\nSource: ${hotspot.source}`;
  }

  toggleHotspots(): void {
    this.showHotspots = !this.showHotspots;
    if (!this.showHotspots) {
      this.selectedHotspotId = '';
    }
  }

  selectVisualCategory(category: string): void {
    this.selectedVisualCategory = category;
  }

  selectPerformanceCategory(category: string): void {
    this.selectedPerformanceCategory = category;
  }

  openPhotoViewer(src: string, alt: string, caption?: string): void {
    this.activePhoto = { src, alt, caption };
  }

  closePhotoViewer(): void {
    this.activePhoto = null;
  }

  onApproveBuild(): void {
    const buildId = this.route.snapshot.data['build']?.data?.id;

    if (!buildId) {
      return;
    }

    const confirmCallback = () => {
      return this.buildDataService.approveBuild(buildId).pipe(
        tap(() => {
          this.approveBuild.emit();
          Swal.fire({
            icon: 'success',
            title: 'Build Approved',
            text: 'The build has been approved successfully.',
          });
          this.router.navigate(['/admin/builds']);
        }),
      );
    };

    this.modalService.show(ConfirmationModalComponent, {
      class: 'modal-dialog-centered',
      initialState: {
        title: 'Approve Build',
        message:
          'Are you sure you want to approve this build? Once approved, it will be visible to everyone.',
        confirmText: 'Approve Build',
        cancelText: 'Cancel',
        confirmCallback,
      },
    });
  }

  onRejectBuild(): void {
    const rejectCallback = (reason: string) => {
      return this.buildDataService
        .rejectBuild(this.route.snapshot.data['build']?.data?.id, reason)
        .pipe(
          finalize(() => {
            Swal.fire({
              icon: 'success',
              title: 'Build Rejected',
              text: 'The build has been rejected successfully.',
            });
            this.router.navigate(['/admin/builds']);
          }),
        );
    };

    this.modalService.show(RejectReasonModalComponent, {
      class: 'modal-md',
      initialState: {
        title: 'Reject Build',
        message:
          'Provide a clear reason for rejecting this build. This will be shared with the owner.',
        confirmText: 'Reject Build',
        reasonPlaceholder: 'Type reject reason here',
        rejectCallback,
      },
    });
  }

  onAngleImageError(): void {
    this.angleImageMap[this.selectedAngle] = '';
    this.imageLoaded = false;
    this.selectedHotspotId = '';
  }

  private applyResolvedBuild(build: Build): void {
    this.buildTitle = `${build.year} ${build.make} ${build.model}`;
    this.ownerName = build.user?.fullName || 'Builder';
    this.ownerHandle = `@${this.toHandle(build.user?.fullName)}`;
    this.ownerLocation = 'Philippines';
    this.ownerMeta = `${build.visualMods?.length ?? 0} visual mods · ${build.performanceMods?.length ?? 0} performance mods`;
    this.totalHearts = build.totalHearts ?? 0;
    this.totalFollows = build.totalFollows ?? 0;
    this.ownerPhotoUrl = build.user?.profilePhotoUrl ?? null;
    this.buildTags = this.parseTags(build.buildTags);

    this.angleImageMap = {
      front: build.frontSlantPhotoUrl || '',
      side: build.sidePhotoUrl || '',
      rear: build.rearSlantPhotoUrl || '',
    };

    this.gallery =
      build.gallery?.map((item, index) => ({
        title: `Build Photo ${index + 1}`,
        image: item.photoURL,
      })) || [];

    this.visualMods = (build.visualMods || []).map((mod) =>
      this.mapVisualMod(mod),
    );

    this.performanceMods = (build.performanceMods || []).map((mod) =>
      this.mapPerformanceMod(mod),
    );

    this.hotspots = this.mapHotspots(build.visualMods || []);
    this.selectedHotspotId = '';
  }

  private mapVisualMod(mod: BuildVisualMod): BuildMod {
    const category = this.categoryFromPartType(mod.partType);
    return {
      id: `visual-${mod.id}`,
      name: mod.modName,
      brand: mod.source || 'Unknown',
      partType: mod.partType,
      description: mod.description || 'No description provided.',
      image: mod.modPhotoUrl || '',
      category,
      categoryLabel: category,
      categoryTagClass: this.tagClassFromCategory(category),
      specs: [{ key: 'Part Type', value: mod.partType || 'N/A' }],
      price: this.formatPrice(mod.price),
      source: mod.source || 'N/A',
    };
  }

  private mapPerformanceMod(mod: BuildPerformanceMod): BuildMod {
    const group = (this.perfPartToGroup.get(
      (mod.partType || '').toLowerCase(),
    ) || 'Engine & Power') as BuildMod['category'];
    return {
      id: `performance-${mod.id}`,
      name: mod.modName,
      brand: mod.source || 'Unknown',
      partType: mod.partType,
      description: mod.description || 'No description provided.',
      image: '',
      category: group,
      categoryLabel: group,
      categoryTagClass: 'tag-green',
      specs: mod.partType ? [{ key: 'Part Type', value: mod.partType }] : [],
      price: this.formatPrice(mod.price),
      source: mod.source || 'N/A',
    };
  }

  private mapHotspots(mods: BuildVisualMod[]): BuildHotspot[] {
    return mods.flatMap((mod) =>
      (mod.hotspots || []).map((hs) => ({
        id: `hs-${hs.id}`,
        part: mod.modName,
        angle: this.angleFromPhotoType(hs.buildPhotoType),
        category: this.categoryFromPartType(mod.partType),
        x: hs.x,
        y: hs.y,
        detail: mod.description || mod.partType || 'Build part',
        price: this.formatPrice(mod.price),
        source: mod.source || 'N/A',
      })),
    );
  }

  private parseTags(tags: string | null | undefined): string[] {
    return (
      tags
        ?.split(',')
        .map((tag) => tag.trim())
        .filter(Boolean) || []
    );
  }

  private angleFromPhotoType(type: BuildPhotoType): BuildAngle {
    if (type === BuildPhotoType.FrontSlant) return 'front';
    if (type === BuildPhotoType.RearSlant) return 'rear';
    return 'side';
  }

  private categoryFromPartType(partType: string): BuildMod['category'] {
    const part = (partType || '').toLowerCase();
    if (part.includes('wheel') || part.includes('tire') || part.includes('rim'))
      return 'Wheels';
    if (
      part.includes('spoiler') ||
      part.includes('ducktail') ||
      part.includes('canard') ||
      part.includes('vortex') ||
      part.includes('wing')
    )
      return 'Aero';
    if (
      part.includes('paint') ||
      part.includes('livery') ||
      part.includes('wrap') ||
      part.includes('windshield')
    )
      return 'Paint & Decals';
    if (part.includes('louver') || part.includes('spat'))
      return 'Others Visual Mods';
    return 'Bodykits';
  }

  private formatPrice(price: number): string {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    }).format(price || 0);
  }

  private tagClassFromCategory(category: BuildMod['category']): string {
    const map: Record<BuildMod['category'], string> = {
      Bodykits: 'tag-blue',
      Aero: 'tag-red',
      Wheels: 'tag-dark',
      'Paint & Decals': 'tag-yellow',
      'Others Visual Mods': 'tag-gray',
      'Engine & Power': 'tag-green',
      'Drivetrain & Transmission': 'tag-green',
      'Suspension & Handling': 'tag-green',
    };
    return map[category] || 'tag-gray';
  }

  private capitalize(value: string): string {
    return value ? value[0].toUpperCase() + value.slice(1) : '';
  }

  private toHandle(fullName?: string): string {
    if (!fullName) return 'builder';
    return fullName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '.')
      .replace(/^\.|\.$/, '');
  }

  private loadModTypes(): void {
    this.http
      .get<{
        visualMods: ModGroup[];
        performanceMods: ModGroup[];
      }>('json/mod-types.json')
      .subscribe({
        next: (data) => {
          this.visualGroups = [
            { key: 'all', label: 'All' },
            ...(data.visualMods || []).map((g) => ({
              key: g.group,
              label: g.group,
            })),
          ];
          this.performanceGroups = [
            { key: 'all', label: 'All' },
            ...(data.performanceMods || []).map((g) => ({
              key: g.group,
              label: g.group,
            })),
          ];
          (data.visualMods || []).forEach((g) =>
            g.mods.forEach((m) =>
              this.visualPartToGroup.set(m.toLowerCase(), g.group),
            ),
          );
          (data.performanceMods || []).forEach((g) =>
            g.mods.forEach((m) =>
              this.perfPartToGroup.set(m.toLowerCase(), g.group),
            ),
          );
        },
        error: () => {},
      });
  }
}
