import { Component, Input } from '@angular/core';
import { BuildHighlight } from '../../models/build-highlight.model';

@Component({
  selector: 'cap-build-highlight',
  standalone: false,
  templateUrl: './build-highlight.component.html',
  styleUrl: './build-highlight.component.scss',
})
export class BuildHighlightComponent {
  @Input() highlight!: BuildHighlight;
}
