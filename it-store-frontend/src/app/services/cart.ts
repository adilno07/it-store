import { Injectable, signal, computed } from '@angular/core';

export interface CartProduct {
  id: number;
  name: string;
  price: number;
  quantity: number; // stock disponible
}

export interface CartItem {
  product: CartProduct;
  quantity: number; // quantité choisie par le client
}

@Injectable({
  providedIn: 'root',
})
export class Cart {
  private storageKey = 'shop_cart';

  items = signal<CartItem[]>(this.loadCart());

  total = computed(() =>
    this.items().reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  );

  itemCount = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));

  private loadCart(): CartItem[] {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? JSON.parse(raw) : [];
  }

  private saveCart() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.items()));
  }

  addToCart(product: CartProduct, quantity: number = 1) {
    const current = this.items();
    const existing = current.find((item) => item.product.id === product.id);
    const alreadyInCart = existing ? existing.quantity : 0;

    if (alreadyInCart + quantity > product.quantity) {
      alert(
        `Stock insuffisant. Disponible : ${product.quantity}, déjà dans le panier : ${alreadyInCart}`,
      );
      return;
    }

    if (existing) {
      existing.quantity += quantity;
      this.items.set([...current]);
    } else {
      this.items.set([...current, { product, quantity }]);
    }
    this.saveCart();
  }

  updateQuantity(productId: number, quantity: number) {
    const current = this.items();
    const item = current.find((i) => i.product.id === productId);
    if (!item) return;

    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    if (quantity > item.product.quantity) {
      alert(`Stock insuffisant. Disponible : ${item.product.quantity}`);
      return;
    }

    item.quantity = quantity;
    this.items.set([...current]);
    this.saveCart();
  }

  removeFromCart(productId: number) {
    this.items.set(this.items().filter((item) => item.product.id !== productId));
    this.saveCart();
  }

  clearCart() {
    this.items.set([]);
    this.saveCart();
  }
}
