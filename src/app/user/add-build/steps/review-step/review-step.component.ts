import { Component, EventEmitter, Output } from '@angular/core';
import { BuildWizardService } from '../../build-wizard.service';
import { BuildWizardState, WIZARD_VIEWS } from '../../build-wizard.model';

@Component({
  selector: 'cap-review-step',
  standalone: false,
  templateUrl: './review-step.component.html',
  styleUrl: './review-step.component.scss',
})
export class ReviewStepComponent {
  @Output() statusChange = new EventEmitter<string>();

  constructor(private wizard: BuildWizardService) {}

  get state(): BuildWizardState {
    return this.wizard.state;
  }

  get buildTitle(): string {
    return this.state.info.title || 'Untitled Build';
  }

  get buildOverview(): string {
    const { title, year, make, model, summary } = this.state.info;
    const titleStr = title || 'Untitled Build';
    const makeModel = `${year || ''} ${make || ''} ${model || ''}`.trim();
    return `${titleStr}${makeModel ? ` (${makeModel})` : ''}. ${summary || 'No summary yet.'}`;
  }

  get photoLines(): string[] {
    return WIZARD_VIEWS.map((view) => {
      const p = this.state.requiredPhotos[view];
      return `${view}: ${p ? p.name : 'Missing required image'}`;
    });
  }

  get modLines(): string[] {
    if (this.state.visualMods.length === 0) return ['No visual mods added yet.'];
    return this.state.visualMods.map((mod) => {
      const mapped = WIZARD_VIEWS.filter((v) => Boolean(mod.hotspots[v])).join(', ') || 'no hotspots yet';
      return `${mod.name} (${mod.part}) — ${mapped}`;
    });
  }

  get perfLines(): string[] {
    if (this.state.performanceSkipped) return ['Performance mods skipped.'];
    if (this.state.performanceMods.length === 0) return ['No performance mods added yet.'];
    return this.state.performanceMods.map(
      (m) => `${m.name} — ${m.shop || 'No shop'} — ${m.priceEstimate || 'No estimate'}`
    );
  }

  get galleryCount(): string {
    return `${this.state.gallery.length} image(s)`;
  }

  saveDraft(): void {
    this.wizard.saveBuild('draft');
    this.statusChange.emit('Build saved as draft.');
  }

  publish(): void {
    this.wizard.saveBuild('published');
    this.statusChange.emit('Build published successfully.');
  }
}
