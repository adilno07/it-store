import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Cart } from '../../services/cart';
import { Toast } from '../../services/toast';

@Component({
  selector: 'app-shop-cart',
  imports: [FormsModule, RouterLink],
  templateUrl: './shop-cart.html',
  styleUrl: './shop-cart.css',
})
export class ShopCart {
  constructor(
    public cart: Cart,
    private router: Router,
    private toast: Toast,
  ) {}

  onQuantityChange(productId: number, quantity: number) {
    this.cart.updateQuantity(productId, quantity);
  }

  removeItem(productId: number) {
    this.cart.removeFromCart(productId);
  }

  goToCheckout() {
    if (this.cart.items().length === 0) {
      this.toast.error('Votre panier est vide.');
      return;
    }
    this.router.navigate(['/shop/checkout']);
  }
}
