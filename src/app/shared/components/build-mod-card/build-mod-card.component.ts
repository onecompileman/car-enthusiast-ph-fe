import { Component, Input } from '@angular/core';
import { BuildMod } from '../../models/build/build-mod.model';

@Component({
  selector: 'cap-build-mod-card',
  standalone: false,
  templateUrl: './build-mod-card.component.html',
  styleUrl: './build-mod-card.component.scss',
})
export class BuildModCardComponent {
  @Input() mod!: BuildMod;
  @Input() highlightPrice = false;

  get hasImage(): boolean {
    return !!this.mod?.image?.trim();
  }
}
