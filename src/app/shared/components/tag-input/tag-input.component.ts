import { Component, EventEmitter, Input, Output } from '@angular/core';

const ALLOWED_TAG_RE = /^[a-zA-Z0-9\-_. ]+$/;

@Component({
  selector: 'cap-tag-input',
  standalone: false,
  templateUrl: './tag-input.component.html',
  styleUrl: './tag-input.component.scss',
})
export class TagInputComponent {
  @Input() tags: string[] = [];
  @Input() maxTags = 10;
  @Input() maxLength = 28;
  @Input() placeholder = 'Add a tag — press Enter or comma to confirm';
  @Output() tagsChange = new EventEmitter<string[]>();

  inputValue = '';
  error = '';

  get atLimit(): boolean {
    return this.tags.length >= this.maxTags;
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.commit();
    }
  }

  onBlur(): void {
    if (this.inputValue.trim()) this.commit();
  }

  remove(index: number): void {
    this.tagsChange.emit(this.tags.filter((_, i) => i !== index));
  }

  private commit(): void {
    const raw = this.inputValue.replace(/,/g, '').trim();
    this.inputValue = '';
    this.error = '';

    if (!raw) return;

    if (raw.length > this.maxLength) {
      this.error = `Tags must be ${this.maxLength} characters or fewer.`;
      return;
    }

    if (!ALLOWED_TAG_RE.test(raw)) {
      this.error = 'Tags may only contain letters, numbers, hyphens, underscores, dots, and spaces.';
      return;
    }

    if (this.tags.length >= this.maxTags) {
      this.error = `Maximum ${this.maxTags} tags allowed.`;
      return;
    }

    if (this.tags.map((t) => t.toLowerCase()).includes(raw.toLowerCase())) {
      this.error = 'This tag is already added.';
      return;
    }

    this.tagsChange.emit([...this.tags, raw]);
  }
}
