import { Component } from '@angular/core';
import { BuildCarouselSlide } from '../../shared/components/builds-carousel/builds-carousel.component';

@Component({
  selector: 'cap-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  protected readonly slides: BuildCarouselSlide[] = [
    {
      tag: 'Featured Build',
      kicker: 'Track-ready hatch',
      title: 'Honda FK8 Civic Type R',
      subtitle:
        'Street-tuned aero, forged wheels, and a clean red-on-carbon cockpit.',
      stat: '312 whp',
      meta: 'Manila build log',
      image: './images/fk8.jpg',
    },
    {
      tag: 'Community Pick',
      kicker: 'Stance-focused coupe',
      title: 'Toyota GR86 Stance',
      subtitle:
        'Aggressive fitment, satin bronze wheels, and detail-first body lines.',
      stat: '19-inch setup',
      meta: 'Cavite weekend car',
      image: './images/gr86.jpg',
    },
    {
      tag: 'Garage Spotlight',
      kicker: 'Performance sedan',
      title: 'BMW M3 E92 Track',
      subtitle:
        'Brake cooling, square setup, and a no-drama circuit-ready interior.',
      stat: '2:18 Clark pace',
      meta: 'Track day setup',
      image: './images/m3.jpg',
    },
  ];
}
