import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Cart } from '../../services/cart';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  category: Category | null;
}

@Component({
  selector: 'app-shop-catalog',
  imports: [FormsModule],
  templateUrl: './shop-catalog.html',
  styleUrl: './shop-catalog.css',
})
export class ShopCatalog implements OnInit {
  products: Product[] = [];
  searchTerm: string = '';
  baseUrl = 'http://localhost:8080';

  private apiUrl = 'http://localhost:8080/api/public/products';
  private searchTimeout: any;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    public cart: Cart,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.http.get<Product[]>(this.apiUrl).subscribe((data) => {
      this.products = data;
      this.cdr.markForCheck();
    });
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      if (this.searchTerm.trim()) {
        this.http
          .get<Product[]>(`${this.apiUrl}/search`, { params: { name: this.searchTerm.trim() } })
          .subscribe((data) => {
            this.products = data;
            this.cdr.markForCheck();
          });
      } else {
        this.loadProducts();
      }
    }, 400);
  }

  addToCart(product: Product) {
    this.cart.addToCart(
      { id: product.id, name: product.name, price: product.price, quantity: product.quantity },
      1,
    );
  }

  goToCart() {
    this.router.navigate(['/shop/cart']);
  }
}
