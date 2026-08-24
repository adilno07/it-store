import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Toast } from '../../services/toast';

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  brand: Brand | null;
  category: Category | null;
}

type StockFilter = 'all' | 'outOfStock' | 'low' | 'ok';

@Component({
  selector: 'app-stock-list',
  imports: [FormsModule],
  templateUrl: './stock-list.html',
  styleUrl: './stock-list.css',
})
export class StockList implements OnInit {
  products: Product[] = [];
  activeFilter: StockFilter = 'all';

  editingId: number | null = null;
  editingQuantity: number | null = null;

  private apiUrl = 'http://localhost:8080/api/products';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private toast: Toast,
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.http.get<Product[]>(this.apiUrl).subscribe((data) => {
      this.products = data.sort((a, b) => a.quantity - b.quantity);
      this.cdr.markForCheck();
    });
  }

  get filteredProducts(): Product[] {
    switch (this.activeFilter) {
      case 'outOfStock':
        return this.products.filter((p) => p.quantity === 0);
      case 'low':
        return this.products.filter((p) => p.quantity > 0 && p.quantity <= 5);
      case 'ok':
        return this.products.filter((p) => p.quantity > 5);
      default:
        return this.products;
    }
  }

  get outOfStockCount(): number {
    return this.products.filter((p) => p.quantity === 0).length;
  }

  get lowStockCount(): number {
    return this.products.filter((p) => p.quantity > 0 && p.quantity <= 5).length;
  }

  setFilter(filter: StockFilter) {
    this.activeFilter = filter;
  }

  startEditQuantity(product: Product) {
    this.editingId = product.id;
    this.editingQuantity = product.quantity;
  }

  cancelEditQuantity() {
    this.editingId = null;
    this.editingQuantity = null;
  }

  saveQuantity(product: Product) {
    if (this.editingQuantity === null || this.editingQuantity < 0) {
      this.toast.error('La quantité doit être 0 ou plus.');
      return;
    }

    const payload = {
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: this.editingQuantity,
      brand: product.brand ? { id: product.brand.id } : null,
      category: product.category ? { id: product.category.id } : null,
    };

    this.http.put<Product>(`${this.apiUrl}/${product.id}`, payload).subscribe(() => {
      this.loadProducts();
      this.editingId = null;
      this.editingQuantity = null;
      this.toast.success('Stock mis à jour.');
    });
  }
}
