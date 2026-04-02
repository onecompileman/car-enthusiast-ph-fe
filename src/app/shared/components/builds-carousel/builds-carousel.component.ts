import { Component, Input } from '@angular/core';

export interface BuildCarouselSlide {
  tag: string;
  kicker: string;
  title: string;
  subtitle: string;
  stat?: string;
  meta: string;
  image: string;
}

@Component({
  selector: 'cap-builds-carousel',
  standalone: false,
  templateUrl: './builds-carousel.component.html',
  styleUrl: './builds-carousel.component.scss',
})
export class BuildsCarouselComponent {
  @Input() slides: BuildCarouselSlide[] = [];
  @Input() interval = 5000;
}
