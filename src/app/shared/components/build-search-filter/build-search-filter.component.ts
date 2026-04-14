import { Component, EventEmitter, Output } from '@angular/core';
import { BuildFilter } from '../../models/build/build-listing.model';

@Component({
  selector: 'cap-build-search-filter',
  standalone: false,
  templateUrl: './build-search-filter.component.html',
  styleUrl: './build-search-filter.component.scss',
})
export class BuildSearchFilterComponent {
  @Output() filterChange = new EventEmitter<BuildFilter>();

  filter: BuildFilter = { make: '', model: '', style: 'all' };

  readonly popularMakes = ['Honda', 'Toyota', 'Nissan', 'BMW', 'Subaru'];

  onChange(): void {
  }

  selectMake(make: string): void {
    this.filter.make =
      this.filter.make.toLowerCase() === make.toLowerCase() ? '' : make;
    this.onChange();
  }

  reset(): void {
    this.filter = { make: '', model: '', style: 'all' };
    this.filterChange.emit({ ...this.filter });
  }

  search(): void {
    this.filterChange.emit({ ...this.filter });
  }
}
