import { Component } from '@angular/core';
import { BuildHighlight } from '../../shared/models/build-highlight.model';

@Component({
  selector: 'cap-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected readonly highlight: BuildHighlight = {
    image: '/images/fk8.jpg',
    imageAlt: 'Honda FK8 Civic Type R — Build Highlight of the Month',
    title: 'Honda FK8 Civic Type R',
    caption: 'Track-ready street build · 312 whp · forged wheels · Manila',
    ownerInitials: 'JR',
    ownerName: 'Juan Reyes',
  };
}
