import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Cart } from '../../services/cart';
import { Favorites } from '../../services/favorites';
import { CustomerAuth } from '../../services/customer-auth';

@Component({
  selector: 'app-my-favorites',
  imports: [],
  templateUrl: './my-favorites.html',
  styleUrl: './my-favorites.css',
})
export class MyFavorites implements OnInit {
  baseUrl = 'http://localhost:8080';

  constructor(
    public favorites: Favorites,
    public cart: Cart,
    private customerAuth: CustomerAuth,
    private router: Router,
  ) {}

  ngOnInit() {
    if (!this.customerAuth.isLoggedIn()) {
      this.router.navigate(['/account/login']);
      return;
    }
    this.favorites.loadFavorites();
  }

  removeFavorite(productId: number, productName: string, event: Event) {
    event.stopPropagation();
    this.favorites.toggle(productId, productName);
  }

  addToCart(product: { id: number; name: string; price: number; quantity: number }) {
    this.cart.addToCart(product, 1);
  }

  goToShop() {
    this.router.navigate(['/shop']);
  }
}
