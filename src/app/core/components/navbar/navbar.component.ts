import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { User } from '../../../shared/models/auth/user.model';
import { Subscription, tap } from 'rxjs';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { Router } from '@angular/router';

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
    private bsModalService: BsModalService,
    private router: Router,
  ) {}

  ngOnDestroy(): void {
    Object.values(this.subscriptions).forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.document.body.setAttribute('data-theme', 'dark');
    this.loadUserInfo();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout() {
    const title = "Confirm Logout";
    const message = "Are you sure you want to log out?";
    const confirmButtonText = "Log Out";
    const cancelButtonText = "Cancel";

    const confirmCallback = () => {
      return this.authService.signOut().pipe(tap(() => {
        this.router.navigate(['/']);
      }));
    };

    const modalRef = this.bsModalService.show(ConfirmationModalComponent, {
      initialState: {
        title,
        message,
        confirmText: confirmButtonText,
        cancelText: cancelButtonText,
        confirmCallback
      },
    });
  }

  private loadUserInfo(): void {
    this.userInfo = this.authService.getActiveUserFromLocalStorage();

    this.subscriptions['activeUser'] = this.authService.activeUser.subscribe(
      (user) => {
          this.userInfo = user;
        
      },
    );
  }
}
