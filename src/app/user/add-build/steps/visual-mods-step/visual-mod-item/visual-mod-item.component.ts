import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VisualMod, WizardView } from '../../../build-wizard.model';

@Component({
  selector: 'cap-visual-mod-item',
  standalone: false,
  templateUrl: './visual-mod-item.component.html',
  styleUrl: './visual-mod-item.component.scss',
})
export class VisualModItemComponent {
  @Input({ required: true }) mod!: VisualMod;
  @Input() activeView: WizardView = 'side';
  @Input() isPlacing = false;

  @Output() edit = new EventEmitter<VisualMod>();
  @Output() place = new EventEmitter<string>();
  @Output() remove = new EventEmitter<string>();

  hotspotLabel(): string {
    const point = this.mod.hotspots[this.activeView];
    return point
      ? `Hotspot ${this.activeView}: ${point.x.toFixed(1)}%, ${point.y.toFixed(1)}%`
      : `No ${this.activeView} hotspot yet`;
  }

  onEdit(): void {
    this.edit.emit(this.mod);
  }

  onPlace(): void {
    this.place.emit(this.mod.id);
  }

  onRemove(): void {
    this.remove.emit(this.mod.id);
  }
}
