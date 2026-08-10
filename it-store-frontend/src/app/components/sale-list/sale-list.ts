import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface SaleItemView {
  id: number;
  product: Product;
  quantity: number;
  unitPrice: number;
}

interface SaleView {
  id: number;
  customer: Customer | null;
  saleDate: string;
  total: number;
  items: SaleItemView[];
}

@Component({
  selector: 'app-sale-list',
  imports: [FormsModule, CommonModule],
  templateUrl: './sale-list.html',
  styleUrl: './sale-list.css',
})
export class SaleList implements OnInit {
  customers: Customer[] = [];
  products: Product[] = [];
  sales: SaleView[] = [];
  cart: CartItem[] = [];

  selectedCustomerId: number | null = null;
  selectedProductId: number | null = null;
  selectedQuantity: number = 1;

  private customersUrl = 'http://localhost:8080/api/customers';
  private productsUrl = 'http://localhost:8080/api/products';
  private salesUrl = 'http://localhost:8080/api/sales';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadCustomers();
    this.loadProducts();
    this.loadSales();
  }

  loadCustomers() {
    this.http.get<Customer[]>(this.customersUrl).subscribe((data) => {
      this.customers = data;
      this.cdr.markForCheck();
    });
  }

  loadProducts() {
    this.http.get<Product[]>(this.productsUrl).subscribe((data) => {
      this.products = data;
      this.cdr.markForCheck();
    });
  }

  loadSales() {
    this.http.get<SaleView[]>(this.salesUrl).subscribe((data) => {
      this.sales = data.sort((a, b) => b.id - a.id);
      this.cdr.markForCheck();
    });
  }

  get cartTotal(): number {
    return this.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  addToCart() {
    if (!this.selectedProductId || this.selectedQuantity <= 0) {
      alert('Choisissez un produit et une quantité valide.');
      return;
    }

    const product = this.products.find((p) => p.id === this.selectedProductId);
    if (!product) return;

    const existing = this.cart.find((item) => item.product.id === product.id);
    const alreadyInCart = existing ? existing.quantity : 0;

    if (alreadyInCart + this.selectedQuantity > product.quantity) {
      alert(
        `Stock insuffisant. Disponible : ${product.quantity}, déjà dans le panier : ${alreadyInCart}`,
      );
      return;
    }

    if (existing) {
      existing.quantity += this.selectedQuantity;
    } else {
      this.cart.push({ product, quantity: this.selectedQuantity });
    }

    this.selectedProductId = null;
    this.selectedQuantity = 1;
  }

  removeFromCart(productId: number) {
    this.cart = this.cart.filter((item) => item.product.id !== productId);
  }

  submitSale() {
    if (this.cart.length === 0) {
      alert('Le panier est vide.');
      return;
    }

    const payload = {
      customerId: this.selectedCustomerId,
      items: this.cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    this.http.post<SaleView>(this.salesUrl, payload).subscribe({
      next: () => {
        this.cart = [];
        this.selectedCustomerId = null;
        this.loadProducts();
        this.loadSales();
      },
      error: (err) => {
        alert(err.error || 'Erreur lors de la création de la vente.');
      },
    });
  }
}
