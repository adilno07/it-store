import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Cart } from '../../services/cart';

@Component({
  selector: 'app-shop-checkout',
  imports: [FormsModule, RouterLink],
  templateUrl: './shop-checkout.html',
  styleUrl: './shop-checkout.css',
})
export class ShopCheckout {
  firstName: string = '';
  lastName: string = '';
  phone: string = '';
  email: string = '';
  address: string = '';

  errorMessage: string = '';
  orderConfirmed: boolean = false;

  private apiUrl = 'http://localhost:8080/api/public/orders';

  constructor(
    public cart: Cart,
    private http: HttpClient,
    private router: Router,
  ) {}

  onSubmit() {
    this.errorMessage = '';

    const phonePattern = /^(0[5-7][0-9]{8}|\+212[5-7][0-9]{8})$/;

    if (!this.firstName.trim() || !this.lastName.trim()) {
      this.errorMessage = 'Merci de remplir le prénom et le nom.';
      return;
    }

    if (!phonePattern.test(this.phone.trim())) {
      this.errorMessage = 'Numéro de téléphone invalide. Format attendu : 0612345678';
      return;
    }

    const payload = {
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      email: this.email,
      address: this.address,
      items: this.cart.items().map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    this.http.post(this.apiUrl, payload).subscribe({
      next: () => {
        this.orderConfirmed = true;
        this.cart.clearCart();
      },
      error: (err) => {
        this.errorMessage = err.error || 'Erreur lors de la commande. Merci de réessayer.';
      },
    });
  }

  backToShop() {
    this.router.navigate(['/shop']);
  }
}
