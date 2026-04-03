import {  Injectable } from '@angular/core';
import {
  BuildWizardState,
  GalleryPhoto,
  PerformanceMod,
  RequiredPhoto,
  ValidatedPhoto,
  VisualMod,
  WizardView,
} from './build-wizard.model';

const BUILDS_STORAGE_KEY = 'ceph-user-builds';

@Injectable({ providedIn: 'root' })
export class BuildWizardService {
  private _state: BuildWizardState = {
    info: { title: '', year: '', make: '', model: '', summary: '', approxCost: '' },
    tags: [],
    requiredPhotos: { front: null, side: null, rear: null },
    gallery: [],
    visualMods: [],
    performanceMods: [],
    performanceSkipped: false,
  };

  constructor() {}

  get state(): BuildWizardState {
    return this._state;
  }

  patchInfo(partial: Partial<BuildWizardState['info']>): void {
    this._state.info = { ...this._state.info, ...partial };
  }

  setTags(tags: string[]): void {
    this._state.tags = tags;
  }

  setRequiredPhoto(view: WizardView, photo: ValidatedPhoto): void {
    this._state.requiredPhotos[view] = photo;
  }

  setGallery(photos: ValidatedPhoto[]): void {
    this._state.gallery = photos;
  }

  addVisualMod(mod: VisualMod): void {
    this._state.visualMods = [...this._state.visualMods, mod];
  }

  updateVisualMod(id: string, patch: Partial<VisualMod>): void {
    this._state.visualMods = this._state.visualMods.map((mod) =>
      mod.id === id ? { ...mod, ...patch } : mod
    );
  }

  removeVisualMod(id: string): void {
    this._state.visualMods = this._state.visualMods.filter((m) => m.id !== id);
  }

  placeHotspot(modId: string, view: WizardView, x: number, y: number): void {
    this._state.visualMods = this._state.visualMods.map((mod) =>
      mod.id === modId
        ? { ...mod, hotspots: { ...mod.hotspots, [view]: { x, y } } }
        : mod
    );
  }

  addPerformanceMod(mod: PerformanceMod): void {
    this._state.performanceMods = [...this._state.performanceMods, mod];
  }

  removePerformanceMod(id: string): void {
    this._state.performanceMods = this._state.performanceMods.filter(
      (m) => m.id !== id
    );
  }

  setPerformanceSkipped(value: boolean): void {
    this._state.performanceSkipped = value;
  }

  saveBuild(status: 'draft' | 'published'): void {

    const builds = this.loadBuilds();
    builds.push({
      id: crypto.randomUUID(),
      ...this._state.info,
      status,
      updatedAt: new Date().toISOString(),
      requiredPhotoNames: {
        front: this._state.requiredPhotos.front?.photo.name ?? null,
        side: this._state.requiredPhotos.side?.photo.name ?? null,
        rear: this._state.requiredPhotos.rear?.photo.name ?? null,
      },
      galleryNames: this._state.gallery.map((g) => g.photo.name),
      visualMods: this._state.visualMods,
      performanceSkipped: this._state.performanceSkipped,
      performanceMods: this._state.performanceMods,
    });

    window.localStorage.setItem(BUILDS_STORAGE_KEY, JSON.stringify(builds));
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
