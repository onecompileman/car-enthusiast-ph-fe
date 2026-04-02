import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { PhotoViewerImage } from '../../models/photo-viewer.model';

@Component({
  selector: 'cap-photo-viewer',
  standalone: false,
  templateUrl: './photo-viewer.component.html',
  styleUrl: './photo-viewer.component.scss',
})
export class PhotoViewerComponent {
  @Input() photo: PhotoViewerImage | null = null;
  @Output() close = new EventEmitter<void>();

  zoom = 1;

  get isVisible(): boolean {
    return !!this.photo;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isVisible) {
      this.closeViewer();
    }
  }

  closeViewer(): void {
    this.zoom = 1;
    this.close.emit();
  }

  zoomIn(): void {
    this.zoom = Math.min(3, +(this.zoom + 0.2).toFixed(2));
  }

  zoomOut(): void {
    this.zoom = Math.max(1, +(this.zoom - 0.2).toFixed(2));
  }

  resetZoom(): void {
    this.zoom = 1;
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    if (event.deltaY < 0) {
      this.zoomIn();
      return;
    }
    this.zoomOut();
  }
}
