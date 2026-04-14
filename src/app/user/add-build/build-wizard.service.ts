import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  BuildWizardState,
  PerformanceMod,
  ValidatedPhoto,
  VisualMod,
  WizardView,
} from './build-wizard.model';
import { IndexDbService } from '../../core/services/index-db.service';
import { IndexDbStoreNames } from '../../shared/enums/index-db-store-names.enum';
import { Build, BuildPhotoType } from '../../shared/models/build/build.model';

const BUILDS_STORAGE_KEY = 'ceph-user-builds';

const INITIAL_BUILD_WIZARD_STATE: BuildWizardState = {
  id: null,
  info: {
    title: '',
    year: '',
    make: '',
    model: '',
    summary: '',
    approxCost: '',
  },
  tags: [],
  requiredPhotos: { front: null, side: null, rear: null },
  gallery: [],
  visualMods: [],
  performanceMods: [],
  performanceSkipped: false,
};

@Injectable({ providedIn: 'root' })
export class BuildWizardService {
  private _state = new BehaviorSubject<BuildWizardState>({
    ...INITIAL_BUILD_WIZARD_STATE,
  });
  public isIndexDbPersistenceEnabled = true;
  readonly state$ = this._state.asObservable();

  constructor(private indexDb: IndexDbService) {}

  get state(): BuildWizardState {
    return this._state.value;
  }

  selectState(): Observable<BuildWizardState> {
    return this.state$;
  }

  setIndexDbPersistenceEnabled(enabled: boolean): void {
    this.isIndexDbPersistenceEnabled = enabled;
  }

  initBuild() {
    const unsavedBuildId = localStorage.getItem(BUILDS_STORAGE_KEY);
    if (unsavedBuildId) {
      this.indexDb.isDbInitialized.subscribe((initialized) => {
        if (initialized) {
          this.loadStateFromIndexDb(unsavedBuildId);
        }
      });
    } else {
      localStorage.setItem(BUILDS_STORAGE_KEY, crypto.randomUUID());
    }
  }

  async resetBuild(): Promise<void> {
    this._state.next({ ...INITIAL_BUILD_WIZARD_STATE });
    const unsavedBuildId = localStorage.getItem(BUILDS_STORAGE_KEY);

    try {
      await this.indexDb.deleteState(
        unsavedBuildId!,
        IndexDbStoreNames.CEPH_USER_BUILD_UNSAVED,
      );

      localStorage.removeItem(BUILDS_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing unsaved build from IndexDB:', error);
    }
  }

  patchInfo(partial: Partial<BuildWizardState['info']>): void {
    this.updateState((state) => ({
      ...state,
      info: { ...state.info, ...partial },
    }));
    this.saveBuildToIndexDb();
  }

  setTags(tags: string[]): void {
    this.updateState((state) => ({ ...state, tags }));
    this.saveBuildToIndexDb();
  }

  setRequiredPhoto(view: WizardView, photo: ValidatedPhoto): void {
    this.updateState((state) => ({
      ...state,
      requiredPhotos: { ...state.requiredPhotos, [view]: photo },
    }));
    this.saveBuildToIndexDb();
  }

  setGallery(photos: ValidatedPhoto[]): void {
    this.updateState((state) => ({ ...state, gallery: photos }));
    this.saveBuildToIndexDb();
  }

  addVisualMod(mod: VisualMod): void {
    this.updateState((state) => ({
      ...state,
      visualMods: [...state.visualMods, mod],
    }));
    this.saveBuildToIndexDb();
  }

  updateVisualMod(id: string, patch: Partial<VisualMod>): void {
    this.updateState((state) => ({
      ...state,
      visualMods: state.visualMods.map((mod) =>
        mod.id === id ? { ...mod, ...patch } : mod,
      ),
    }));
    this.saveBuildToIndexDb();
  }

  removeVisualMod(id: string): void {
    this.updateState((state) => ({
      ...state,
      visualMods: state.visualMods.filter((m) => m.id !== id),
    }));
    this.saveBuildToIndexDb();
  }

  placeHotspot(modId: string, view: WizardView, x: number, y: number): void {
    this.updateState((state) => ({
      ...state,
      visualMods: state.visualMods.map((mod) =>
        mod.id === modId
          ? { ...mod, hotspots: { ...mod.hotspots, [view]: { x, y } } }
          : mod,
      ),
    }));
    this.saveBuildToIndexDb();
  }

  addPerformanceMod(mod: PerformanceMod): void {
    this.updateState((state) => ({
      ...state,
      performanceMods: [...state.performanceMods, mod],
    }));
    this.saveBuildToIndexDb();
  }

  removePerformanceMod(id: string): void {
    this.updateState((state) => ({
      ...state,
      performanceMods: state.performanceMods.filter((m) => m.id !== id),
    }));
    this.saveBuildToIndexDb();
  }

  setPerformanceSkipped(value: boolean): void {
    this.updateState((state) => ({ ...state, performanceSkipped: value }));
    this.saveBuildToIndexDb();
  }

  loadStateFromBuild(build: Build): void {
    this._state.next(this.mapBuildToWizardState(build));
  }

  mapBuildToWizardState(build: Build): BuildWizardState {
    const id = build.id ?? null;
    const gallery = (build.gallery ?? [])
      .map((item, index) => {
        const vp = this.mapPhotoUrlToValidatedPhoto(
          item.photoURL,
          `build-${build.id}-gallery-${index + 1}`,
        );
        if (vp) {
          vp.galleryItemId = item.id;
          vp.galleryBuildId = item.buildId;
        }
        return vp;
      })
      .filter((photo): photo is ValidatedPhoto => !!photo);

    const visualMods = (build.visualMods ?? []).map(
      (mod) =>
        ({
          id: `${mod.id}`,
          name: mod.modName ?? '',
          part: mod.partType ?? '',
          description: mod.description ?? '',
          shop: mod.source ?? '',
          priceEstimate: `${mod.price ?? ''}`,
          photo:
            this.mapPhotoUrlToValidatedPhoto(
              mod.modPhotoUrl,
              `visual-mod-${mod.id}`,
            )?.photo ?? null,
          hotspots: {
            front: this.mapHotspotToPoint(
              mod.hotspots,
              BuildPhotoType.FrontSlant,
            ),
            side: this.mapHotspotToPoint(mod.hotspots, BuildPhotoType.Side),
            rear: this.mapHotspotToPoint(
              mod.hotspots,
              BuildPhotoType.RearSlant,
            ),
          },
        }) as VisualMod,
    );

    return {
      id,
      info: {
        title: build.title ?? '',
        year: build.year ? `${build.year}` : '',
        make: build.make ?? '',
        model: build.model ?? '',
        summary: build.buildSummary ?? '',
        approxCost: `${build.approxBuildCost ?? ''}`,
      },
      tags: (build.buildTags ?? '')
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => !!tag),
      requiredPhotos: {
        front: this.mapPhotoUrlToValidatedPhoto(
          build.frontSlantPhotoUrl,
          `build-${build.id}-front`,
        ),
        side: this.mapPhotoUrlToValidatedPhoto(
          build.sidePhotoUrl,
          `build-${build.id}-side`,
        ),
        rear: this.mapPhotoUrlToValidatedPhoto(
          build.rearSlantPhotoUrl,
          `build-${build.id}-rear`,
        ),
      },
      gallery,
      visualMods,
      performanceMods: (build.performanceMods ?? []).map(
        (mod) =>
          ({
            id: `${mod.id}`,
            name: mod.modName ?? '',
            part: mod.partType ?? '',
            description: mod.description ?? '',
            shop: mod.source ?? '',
            priceEstimate: `${mod.price ?? ''}`,
          }) as PerformanceMod,
      ),
      performanceSkipped: false,
    };
  }

  saveBuild(status: 'draft' | 'published'): void {
    const state = this._state.value;
    const builds = this.loadBuilds();
    builds.push({
      id: crypto.randomUUID(),
      ...state.info,
      status,
      updatedAt: new Date().toISOString(),
      requiredPhotoNames: {
        front: state.requiredPhotos.front?.photo.name ?? null,
        side: state.requiredPhotos.side?.photo.name ?? null,
        rear: state.requiredPhotos.rear?.photo.name ?? null,
      },
      galleryNames: state.gallery.map((g) => g.photo.name),
      visualMods: state.visualMods,
      performanceSkipped: state.performanceSkipped,
      performanceMods: state.performanceMods,
    });

    window.localStorage.setItem(BUILDS_STORAGE_KEY, JSON.stringify(builds));
  }

  private loadStateFromIndexDb(unsavedBuildId: string): void {
    this.indexDb
      .getState(unsavedBuildId, IndexDbStoreNames.CEPH_USER_BUILD_UNSAVED)
      .then((savedState) => {
        if (savedState) {
          this._state.next(this.deserializeState(savedState));
        }
      });
  }

  private saveBuildToIndexDb(): void {
    if (!this.isIndexDbPersistenceEnabled) {
      return;
    }

    if (this.indexDb.isDbInitialized.value) {
      const unsavedBuildId = localStorage.getItem(BUILDS_STORAGE_KEY);
      if (!unsavedBuildId) return;
      const serialized = this.serializeState(this._state.value) as Record<
        string,
        unknown
      >;
      this.indexDb.saveState(
        { ...serialized, id: unsavedBuildId },
        IndexDbStoreNames.CEPH_USER_BUILD_UNSAVED,
      );
    }
  }

  private updateState(
    updater: (state: BuildWizardState) => BuildWizardState,
  ): void {
    this._state.next(updater(this._state.value));
  }

  // ── Serialization ───────────────────────────────────────────────
  // IndexDB can store Blob natively but cannot persist ObjectURLs
  // (they are revoked when the session ends) or File references.
  // On write:  keep blob + name only (drop file & url).
  // On read:   rebuild File from blob, regenerate ObjectURL.

  private serializePhoto(photo: import('./build-wizard.model').RequiredPhoto): {
    blob: Blob;
    name: string;
  } {
    return { blob: photo.file, name: photo.name };
  }

  private deserializePhoto(stored: {
    blob: Blob;
    name: string;
  }): import('./build-wizard.model').RequiredPhoto {
    const file = new File([stored.blob], stored.name, {
      type: stored.blob.type,
    });
    const url = URL.createObjectURL(stored.blob);
    return { file, blob: stored.blob, url, name: stored.name };
  }

  private serializeValidatedPhoto(vp: ValidatedPhoto): unknown {
    return { ...vp, photo: this.serializePhoto(vp.photo) };
  }

  private deserializeValidatedPhoto(stored: any): ValidatedPhoto {
    return { ...stored, photo: this.deserializePhoto(stored.photo) };
  }

  private serializeState(state: BuildWizardState): unknown {
    return {
      ...state,
      requiredPhotos: {
        front: state.requiredPhotos.front
          ? this.serializeValidatedPhoto(state.requiredPhotos.front)
          : null,
        side: state.requiredPhotos.side
          ? this.serializeValidatedPhoto(state.requiredPhotos.side)
          : null,
        rear: state.requiredPhotos.rear
          ? this.serializeValidatedPhoto(state.requiredPhotos.rear)
          : null,
      },
      gallery: state.gallery.map((p) => this.serializeValidatedPhoto(p)),
      visualMods: state.visualMods.map((m) => ({
        ...m,
        photo: m.photo ? this.serializePhoto(m.photo) : null,
      })),
    };
  }

  private deserializeState(stored: any): BuildWizardState {
    return {
      ...stored,
      requiredPhotos: {
        front: stored.requiredPhotos.front
          ? this.deserializeValidatedPhoto(stored.requiredPhotos.front)
          : null,
        side: stored.requiredPhotos.side
          ? this.deserializeValidatedPhoto(stored.requiredPhotos.side)
          : null,
        rear: stored.requiredPhotos.rear
          ? this.deserializeValidatedPhoto(stored.requiredPhotos.rear)
          : null,
      },
      gallery: (stored.gallery ?? []).map((p: any) =>
        this.deserializeValidatedPhoto(p),
      ),
      visualMods: (stored.visualMods ?? []).map((m: any) => ({
        ...m,
        photo: m.photo ? this.deserializePhoto(m.photo) : null,
      })),
    };
  }

  private loadBuilds(): unknown[] {
    try {
      const raw = window.localStorage.getItem(BUILDS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private mapHotspotToPoint(
    hotspots: Build['visualMods'][number]['hotspots'],
    type: BuildPhotoType,
  ): { x: number; y: number; id?: number } | null {
    const hotspot = (hotspots ?? []).find(
      (item) => item.buildPhotoType === type,
    );
    if (!hotspot) {
      return null;
    }

    return {
      x: hotspot.x,
      y: hotspot.y,
      id: hotspot.id,
    };
  }

  // Converts persisted API image URLs into URL-backed photos without fetching.
  private mapPhotoUrlToValidatedPhoto(
    photoUrl: string | null | undefined,
    fallbackName: string,
  ): ValidatedPhoto | null {
    if (!photoUrl) {
      return null;
    }
    return this.createUrlBackedValidatedPhoto(photoUrl, fallbackName);
  }

  private createUrlBackedValidatedPhoto(
    photoUrl: string,
    fallbackName: string,
  ): ValidatedPhoto {
    const fileName = this.extractPhotoName(photoUrl, fallbackName, '');
    const blob = new Blob([], { type: 'application/octet-stream' });

    return {
      photo: {
        file: new File([blob], fileName, { type: blob.type }),
        blob,
        url: photoUrl,
        name: fileName,
        isExistingUrl: true,
      },
      isCarPhoto: true,
      isValidSize: true,
      isValidType: true,
      isValidDimensions: true,
      isValidAspectRatio: true,
      isExistingUrl: true,
    };
  }

  private extractPhotoName(
    photoUrl: string,
    fallbackName: string,
    mimeType: string,
  ): string {
    const withoutQuery = photoUrl.split('?')[0];
    const candidate = withoutQuery.split('/').pop()?.trim() ?? '';
    if (candidate) {
      return candidate;
    }

    const extensionByType: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    const extension = extensionByType[mimeType] ?? 'jpg';
    return `${fallbackName}.${extension}`;
  }
}
