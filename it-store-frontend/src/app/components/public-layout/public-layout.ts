import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Cart } from '../../services/cart';
import { Footer } from '../footer/footer';
import { CustomerAuth } from '../../services/customer-auth';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Footer],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css',
})
export class PublicLayout {
  accountMenuOpen = false;

  constructor(
    public cart: Cart,
    public customerAuth: CustomerAuth,
    private router: Router,
  ) {}

  toggleAccountMenu() {
    this.accountMenuOpen = !this.accountMenuOpen;
  }

  closeAccountMenu() {
    this.accountMenuOpen = false;
  }

  logout() {
    this.customerAuth.logout();
    this.closeAccountMenu();
    this.router.navigate(['/']);
  }
}
