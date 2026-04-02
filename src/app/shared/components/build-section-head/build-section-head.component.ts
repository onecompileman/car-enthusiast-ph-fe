import { Component, Input } from '@angular/core';

@Component({
  selector: 'cap-build-section-head',
  standalone: false,
  templateUrl: './build-section-head.component.html',
  styleUrl: './build-section-head.component.scss',
})
export class BuildSectionHeadComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() rightLabel = '';
}
