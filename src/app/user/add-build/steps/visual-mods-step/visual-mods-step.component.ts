import { isPlatformBrowser } from '@angular/common';
import { Component, EventEmitter, Inject, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BuildWizardService } from '../../build-wizard.service';
import { VisualMod, WizardView } from '../../build-wizard.model';

@Component({
  selector: 'cap-visual-mods-step',
  standalone: false,
  templateUrl: './visual-mods-step.component.html',
  styleUrl: './visual-mods-step.component.scss',
})
export class VisualModsStepComponent implements OnInit {
  @Output() statusChange = new EventEmitter<string>();

  activeView: WizardView = 'side';
  placingModId: string | null = null;
  modForm!: FormGroup;
  modImageName = '';

  readonly viewTabs: { view: WizardView; label: string }[] = [
    { view: 'front', label: 'Front Slant' },
    { view: 'side', label: 'Side View' },
    { view: 'rear', label: 'Rear Slant' },
  ];

  constructor(
    private fb: FormBuilder,
    private wizard: BuildWizardService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    this.modForm = this.fb.group({
      name: [''],
      part: [''],
      description: [''],
      shop: [''],
      priceEstimate: [''],
    });
  }

  get mods(): VisualMod[] {
    return this.wizard.state.visualMods;
  }

  get stageImageUrl(): string {
    const photo = this.wizard.state.requiredPhotos[this.activeView];
    return photo?.url ?? 'https://placehold.co/980x560/E8E8E8/999?text=Upload+Required+View+Images+First';
  }

  setView(view: WizardView): void {
    this.activeView = view;
  }

  onModImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.modImageName = input.files?.[0]?.name ?? '';
  }

  addMod(): void {
    const { name, part, description, shop, priceEstimate } = this.modForm.value;
    const mod: VisualMod = {
      id: this.generateId(),
      name: name?.trim() || 'Untitled Visual Mod',
      part: part?.trim() || 'Unspecified Part',
      description: description?.trim() ?? '',
      shop: shop?.trim() ?? '',
      priceEstimate: priceEstimate?.trim() ?? '',
      imageName: this.modImageName,
      hotspots: { front: null, side: null, rear: null },
    };
    this.wizard.addVisualMod(mod);
    this.modForm.reset();
    this.modImageName = '';
    this.statusChange.emit('');
  }

  removeMod(id: string): void {
    if (this.placingModId === id) this.placingModId = null;
    this.wizard.removeVisualMod(id);
  }

  startPlacing(modId: string): void {
    this.placingModId = modId;
    this.statusChange.emit('Click on the image to place the hotspot for the selected mod.');
  }

  onStageClick(event: MouseEvent): void {
    if (!this.placingModId) return;

    const stage = event.currentTarget as HTMLElement;
    const rect = stage.getBoundingClientRect();
    const x = Math.max(1, Math.min(99, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(1, Math.min(99, ((event.clientY - rect.top) / rect.height) * 100));

    this.wizard.placeHotspot(this.placingModId, this.activeView, x, y);
    this.placingModId = null;
    this.statusChange.emit('Hotspot placed.');
  }

  hotspotLabel(mod: VisualMod): string {
    const point = mod.hotspots[this.activeView];
    return point
      ? `Hotspot ${this.activeView}: ${point.x.toFixed(1)}%, ${point.y.toFixed(1)}%`
      : `No ${this.activeView} hotspot yet`;
  }

  private generateId(): string {
    if (isPlatformBrowser(this.platformId) && typeof crypto?.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).slice(2);
  }
}
