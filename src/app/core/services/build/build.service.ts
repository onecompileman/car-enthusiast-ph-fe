import { Injectable } from '@angular/core';
import {
  BuildWizardState,
  GalleryPhoto,
  PerformanceMod,
  ValidatedPhoto,
  VisualMod,
} from '../../../user/add-build/build-wizard.model';
import { Observable, of } from 'rxjs';
import { Build, BuildStatus } from '../../../shared/models/build/build.model';
import { Result } from '../../../shared/models/result.model';
import { BuildDataService } from '../../data-services/build.data-service';

@Injectable({
  providedIn: 'root',
})
export class BuildService {
  constructor(private buildDataService: BuildDataService) {}

  addBuild(
    buildWizard: BuildWizardState,
    status: BuildStatus,
  ): Observable<Result<Build>> {
    const formData = this.mapBuildWizardToFormData(buildWizard);
    formData.append('Status', status);

    return this.buildDataService.shareBuild(formData);
  }

  updateBuild(
    buildWizard: BuildWizardState,
    status: BuildStatus,
  ): Observable<Result<Build>> {
      const formData = this.mapUpdateBuildWizardToFormData(buildWizard);
      formData.append('Status', status);
      formData.append('Id', buildWizard.id?.toString() ?? '');

      return this.buildDataService.updateBuild(formData);
    }

    private mapUpdateBuildWizardToFormData(buildWizard: BuildWizardState): FormData {
    const formData = new FormData();

    formData.append('Title', buildWizard.info.title);
    formData.append('Year', buildWizard.info.year);
    formData.append('Make', buildWizard.info.make);
    formData.append('Model', buildWizard.info.model);
    formData.append('BuildSummary', buildWizard.info.summary);
    formData.append('BuildTags', buildWizard.tags.join(','));
    formData.append('ApproxBuildCost', buildWizard.info.approxCost);

    // Only upload newly replaced required photos
    if (buildWizard.requiredPhotos.front?.photo && !buildWizard.requiredPhotos.front.isExistingUrl) {
      formData.append('FrontSlantPhoto', buildWizard.requiredPhotos.front.photo.file);
    }
    if (buildWizard.requiredPhotos.side?.photo && !buildWizard.requiredPhotos.side.isExistingUrl) {
      formData.append('SidePhoto', buildWizard.requiredPhotos.side.photo.file);
    }
    if (buildWizard.requiredPhotos.rear?.photo && !buildWizard.requiredPhotos.rear.isExistingUrl) {
      formData.append('RearSlantPhoto', buildWizard.requiredPhotos.rear.photo.file);
    }

    // Existing gallery items → Gallery JSON; newly added items → GalleryPhotos files
    const existingGallery = buildWizard.gallery.filter((g) => g.isExistingUrl);
    const newGallery = buildWizard.gallery.filter((g) => !g.isExistingUrl);
    if (existingGallery.length > 0) {
      formData.append(
        'Gallery',
        JSON.stringify(
          existingGallery.map((g) => ({
            id: g.galleryItemId,
            photoURL: g.photo.url,
            buildId: g.galleryBuildId,
          })),
        ),
      );
    }
    newGallery.forEach((gp) => formData.append('GalleryPhotos', gp.photo.file));

    this.mapUpdateVisualModsToFormData(buildWizard.visualMods, formData);

    const perfModsDto = buildWizard.performanceMods.map((pm) => ({
      id: Number.isInteger(Number(pm.id)) ? Number(pm.id) : null,
      modName: pm.name,
      description: pm.description,
      source: pm.shop,
      price: parseInt(pm.priceEstimate, 10) || 0,
    }));
    formData.append('PerformanceMods', JSON.stringify(perfModsDto));

    return formData;
  }

  private mapUpdateVisualModsToFormData(
    visualMods: VisualMod[],
    formData: FormData,
  ): void {
    let newPhotoIndex = 0;

    const visualModsDto = visualMods.map((vm) => {
      let photoIndex: number | null = null;

      if (vm.photo && !vm.photo.isExistingUrl) {
        formData.append('VisualModPhotos', vm.photo.file);
        photoIndex = newPhotoIndex++;
      }

      return {
        id: Number.isInteger(Number(vm.id)) ? Number(vm.id) : null,
        modName: vm.name,
        partType: vm.part,
        description: vm.description,
        source: vm.shop,
        price: parseInt(vm.priceEstimate, 10) || 0,
        photoIndex,
        hotspots: Object.entries(vm.hotspots)
          .filter(([_, point]) => point !== null)
          .map(([key, point]) => ({
            id: point!.id ?? null,
            buildPhotoType: this.mapBuildPhotoType(key),
            x: point!.x,
            y: point!.y,
          })),
      };
    });

    formData.append('VisualMods', JSON.stringify(visualModsDto));
  }

  private mapBuildWizardToFormData(buildWizard: BuildWizardState): FormData {
    const formData = new FormData();

    // Basic build info
    formData.append('Title', buildWizard.info.title);
    formData.append('Year', buildWizard.info.year);
    formData.append('Make', buildWizard.info.make);
    formData.append('Model', buildWizard.info.model);
    formData.append('BuildSummary', buildWizard.info.summary);
    formData.append('BuildTags', buildWizard.tags.join(',')); // comma-separated
    formData.append('ApproxBuildCost', buildWizard.info.approxCost);

    // Required photos
    if (buildWizard.requiredPhotos.front?.photo.file) {
      formData.append(
        'FrontSlantPhoto',
        buildWizard.requiredPhotos.front.photo.file,
      );
    }
    if (buildWizard.requiredPhotos.side?.photo.file) {
      formData.append('SidePhoto', buildWizard.requiredPhotos.side.photo.file);
    }
    if (buildWizard.requiredPhotos.rear?.photo.file) {
      formData.append(
        'RearSlantPhoto',
        buildWizard.requiredPhotos.rear.photo.file,
      );
    }

    // Gallery photos
    this.mapGalleryPhotosToFormData(buildWizard.gallery, formData);

    // Visual mod photos
    this.mapVisualModsToFormData(buildWizard.visualMods, formData);

    // Performance mod photos
    this.mapPerformanceModsToFormData(buildWizard.performanceMods, formData);

    // Status (example: default to Draft)

    return formData;
  }

  private mapVisualModsToFormData(
    visualMods: VisualMod[],
    formData: FormData,
  ): void {
    let newPhotoIndex = 0;

    const visualModsDto = visualMods.map((vm) => {
      let photoIndex: number | null = null;

      if (vm.photo && !vm.photo.isExistingUrl) {
        formData.append('VisualModPhotos', vm.photo.file);
        photoIndex = newPhotoIndex++;
      }

      return {
        modName: vm.name,
        partType: vm.part,
        description: vm.description,
        source: vm.shop,
        price: parseInt(vm.priceEstimate, 10) || 0,
        photoIndex,
        hotspots: Object.entries(vm.hotspots)
          .filter(([_, point]) => point !== null)
          .map(([key, point]) => ({
            buildPhotoType: this.mapBuildPhotoType(key),
            x: point!.x,
            y: point!.y,
          })),
      };
    });

    formData.append('VisualMods', JSON.stringify(visualModsDto));
  }

  private mapBuildPhotoType(type: string): string {
    const mapping: { [key: string]: string } = {
      front: 'FrontSlant',
      side: 'Side',
      rear: 'RearSlant',
    };
    return mapping[type] || type;
  }

  private mapPerformanceModsToFormData(
    performanceMods: PerformanceMod[],
    formData: FormData,
  ): void {
    const perfModsDto = performanceMods.map((pm) => ({
      modName: pm.name,
      partType: pm.part,
      description: pm.description,
      source: pm.shop,
      price: parseInt(pm.priceEstimate, 10) || 0,
    }));

    formData.append('PerformanceMods', JSON.stringify(perfModsDto));
  }

  private mapGalleryPhotosToFormData(
    gallery: ValidatedPhoto[],
    formData: FormData,
  ): void {
    gallery
      .filter((gp) => !gp.isExistingUrl)
      .forEach((gp) => formData.append('GalleryPhotos', gp.photo.file));
  }
}
