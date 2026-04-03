import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, distinctUntilChanged, map } from 'rxjs';
import {
  BuildWizardState,
  PerformanceMod,
  ValidatedPhoto,
  VisualMod,
  WizardView,
} from './build-wizard.model';
import { IndexDbService } from '../../core/services/index-db.service';
import { IndexDbStoreNames } from '../../shared/enums/index-db-store-names.enum';

const BUILDS_STORAGE_KEY = 'ceph-user-builds';

const INITIAL_BUILD_WIZARD_STATE: BuildWizardState = {
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
  readonly state$ = this._state.asObservable();

  constructor(private indexDb: IndexDbService) {}

  get state(): BuildWizardState {
    return this._state.value;
  }

  selectState(): Observable<BuildWizardState> {
    return this.state$;
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

    await this.indexDb.deleteState(
      unsavedBuildId!,
      IndexDbStoreNames.CEPH_USER_BUILD_UNSAVED,
    );
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
    if (this.indexDb.isDbInitialized.value) {
      const unsavedBuildId = localStorage.getItem(BUILDS_STORAGE_KEY);
      if (!unsavedBuildId) return;
      const serialized = this.serializeState(this._state.value) as Record<string, unknown>;
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

  private serializePhoto(
    photo: import('./build-wizard.model').RequiredPhoto,
  ): { blob: Blob; name: string } {
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
}
