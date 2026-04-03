import { Component, EventEmitter, Output } from '@angular/core';
import { take } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BuildWizardService } from '../../build-wizard.service';
import { VisualMod, WizardView } from '../../build-wizard.model';
import {
  VisualModModalComponent,
  VisualModModalEditValue,
  VisualModModalSubmitEvent,
} from '../../../../shared/components/visual-mod-modal/visual-mod-modal.component';

@Component({
  selector: 'cap-visual-mods-step',
  standalone: false,
  templateUrl: './visual-mods-step.component.html',
  styleUrl: './visual-mods-step.component.scss',
})
export class VisualModsStepComponent {
  @Output() statusChange = new EventEmitter<string>();
  private modalRef?: BsModalRef<VisualModModalComponent>;

  activeView: WizardView = 'side';
  placingModId: string | null = null;
  isModDrawerOpen = false;

  readonly viewTabs: { view: WizardView; label: string }[] = [
    { view: 'front', label: 'Front Slant' },
    { view: 'side', label: 'Side View' },
    { view: 'rear', label: 'Rear Slant' },
  ];

  constructor(
    private wizard: BuildWizardService,
    private modalService: BsModalService,
  ) {}

  get mods(): VisualMod[] {
    return this.wizard.state.visualMods;
  }

  get stageImageUrl(): string {
    const photo = this.wizard.state.requiredPhotos[this.activeView];
    return (
      photo?.photo.url ??
      'https://placehold.co/980x560/E8E8E8/999?text=Upload+Required+View+Images+First'
    );
  }

  setView(view: WizardView): void {
    this.activeView = view;
  }

  toggleModDrawer(): void {
    this.isModDrawerOpen = !this.isModDrawerOpen;
  }

  closeModDrawer(): void {
    this.isModDrawerOpen = false;
  }

  openCreateModModal(): void {
    this.modalRef = this.modalService.show(VisualModModalComponent, {
      class: 'modal-lg modal-dialog-centered',
      initialState: {
        mode: 'create',
        initialMod: null,
      },
      backdrop: true,
      ignoreBackdropClick: true,
      keyboard: true,
    });
    this.bindModalSubmit();
  }

  openEditModModal(mod: VisualMod): void {
    const initialMod: VisualModModalEditValue = {
      id: mod.id,
      name: mod.name,
      part: mod.part,
      description: mod.description,
      shop: mod.shop,
      priceEstimate: mod.priceEstimate,
      imageName: mod.imageName,
      imageUrl: mod.imageUrl,
    };

    this.modalRef = this.modalService.show(VisualModModalComponent, {
      class: 'modal-lg modal-dialog-centered',
      initialState: {
        mode: 'edit',
        initialMod,
      },
      backdrop: true,
      ignoreBackdropClick: true,
      keyboard: true,
    });
    this.bindModalSubmit();
  }

  onModalSubmit(event: VisualModModalSubmitEvent): void {
    if (event.mode === 'edit' && event.editId) {
      this.wizard.updateVisualMod(event.editId, event.values);
      this.statusChange.emit('Visual mod updated.');
    } else {
      const mod: VisualMod = {
        id: this.generateId(),
        ...event.values,
        hotspots: { front: null, side: null, rear: null },
      };
      this.wizard.addVisualMod(mod);
      this.statusChange.emit('Visual mod added.');
    }
  }

  removeMod(id: string): void {
    if (this.placingModId === id) this.placingModId = null;
    this.wizard.removeVisualMod(id);
  }

  startPlacing(modId: string): void {
    this.placingModId = modId;
    this.closeModDrawer();
    this.statusChange.emit(
      'Click on the image to place the hotspot for the selected mod.',
    );
  }

  onStageClick(event: MouseEvent): void {
    if (!this.placingModId) return;

    const stage = event.currentTarget as HTMLElement;
    const rect = stage.getBoundingClientRect();
    const x = Math.max(
      1,
      Math.min(99, ((event.clientX - rect.left) / rect.width) * 100),
    );
    const y = Math.max(
      1,
      Math.min(99, ((event.clientY - rect.top) / rect.height) * 100),
    );

    this.wizard.placeHotspot(this.placingModId, this.activeView, x, y);
    this.placingModId = null;
    this.statusChange.emit('Hotspot placed.');
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  private bindModalSubmit(): void {
    const content = this.modalRef?.content;
    if (!content) return;

    content.submitMod
      .pipe(take(1))
      .subscribe((event) => this.onModalSubmit(event));
  }
}
