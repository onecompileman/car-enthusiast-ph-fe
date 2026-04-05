import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { User } from '../../../shared/models/auth/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'cap-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  standalone: false,
})
export class NavbarComponent implements OnInit, OnDestroy {
  userInfo: User | null = null;
  menuOpen = false;

  subscriptions: { [key: string]: Subscription } = {};

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private authService: AuthService,
  ) {}

  ngOnDestroy(): void {
    Object.values(this.subscriptions).forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.document.body.setAttribute('data-theme', 'dark');
    this.loadUserInfo();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  private loadUserInfo(): void {
    this.subscriptions['activeUser'] = this.authService.activeUser.subscribe(
      (user) => {
        this.userInfo = user;
        console.log(user);
      },
    );
  }
}
