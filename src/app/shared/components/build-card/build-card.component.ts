import { Component, Input } from '@angular/core';
import { BuildListing } from '../../models/build-listing.model';

@Component({
  selector: 'cap-build-card',
  standalone: false,
  templateUrl: './build-card.component.html',
  styleUrl: './build-card.component.scss',
})
export class BuildCardComponent {
  @Input() build!: BuildListing;

  get costDisplay(): string {
    if (this.build.cost >= 1_000_000) {
      return `₱${(this.build.cost / 1_000_000).toFixed(1)}M`;
    }
    return `₱${Math.round(this.build.cost / 1_000)}K`;
  }
}
