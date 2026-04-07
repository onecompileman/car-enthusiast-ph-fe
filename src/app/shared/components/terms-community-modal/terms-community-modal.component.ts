import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'cap-terms-community-modal',
  standalone: false,
  templateUrl: './terms-community-modal.component.html',
  styleUrl: './terms-community-modal.component.scss',
})
export class TermsCommunityModalComponent {
  constructor(public bsModalRef: BsModalRef) {}

  close(): void {
    this.bsModalRef.hide();
  }
}
