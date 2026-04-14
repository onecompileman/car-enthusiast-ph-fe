import { Component, Input } from '@angular/core';

export interface BuildStatusCardData {
  id: string;
  title: string;
  year?: number;
  make?: string;
  model?: string;
  status: 'draft' | 'published';
  summary?: string;
  approxCost?: number;
  coverPhoto?: string;
  updatedAt?: string;
}

@Component({
  selector: 'cap-build-status-card',
  standalone: false,
  templateUrl: './build-status-card.component.html',
  styleUrl: './build-status-card.component.scss',
})
export class BuildStatusCardComponent {
  @Input({ required: true }) build!: BuildStatusCardData;
  imageLoaded = false;

  getVehicleLabel(): string {
    const parts = [
      this.build.year,
      this.build.make,
      this.build.model,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'Vehicle not specified';
  }

  getCoverImage(): string {
    return (
      this.build.coverPhoto ||
      'https://placehold.co/900x520/1D2129/F5F7FA?text=Build+Photo'
    );
  }

  onImageError(): void {
    this.imageLoaded = false;
    this.build.coverPhoto = undefined; // Clear the cover photo to prevent repeated errors
  }

  formatCost(): string {
    if (!this.build.approxCost) return 'No estimate';
    return (
      'PHP ' +
      this.build.approxCost.toLocaleString('en-PH', {
        maximumFractionDigits: 0,
      })
    );
  }

  formatDate(): string {
    if (!this.build.updatedAt) return 'Unknown update';
    return new Date(this.build.updatedAt).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
