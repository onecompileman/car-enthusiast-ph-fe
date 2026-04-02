import { Component, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'cap-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  standalone: false
})
export class NavbarComponent implements OnInit {
  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  ngOnInit(): void {
    this.document.body.setAttribute('data-theme', 'dark');
  }
}
