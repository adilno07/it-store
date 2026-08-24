import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Cart } from '../../services/cart';
import { Favorites } from '../../services/favorites';

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
  categories: Category[] = [];
  searchTerm: string = '';
  activeCategoryId: number | null = null;
  baseUrl = 'http://localhost:8080';

  private apiUrl = 'http://localhost:8080/api/public/products';
  private categoriesUrl = 'http://localhost:8080/api/public/categories';
  private searchTimeout: any;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    public cart: Cart,
    private router: Router,
    private route: ActivatedRoute,
    public favorites: Favorites,
  ) {}

  ngOnInit() {
    this.loadCategories();

    this.route.queryParamMap.subscribe((params) => {
      const categoryId = params.get('categoryId');
      this.activeCategoryId = categoryId ? Number(categoryId) : null;
      this.fetchProducts();
    });
  }

  loadCategories() {
    this.http.get<Category[]>(this.categoriesUrl).subscribe({
      next: (data) => {
        this.categories = data;
        this.cdr.markForCheck();
      },
      error: () => {
        this.categories = [];
      },
    });
  }

  fetchProducts() {
    const hasSearch = this.searchTerm.trim().length > 0;
    const hasCategory = this.activeCategoryId !== null;

    if (!hasSearch && !hasCategory) {
      this.http.get<Product[]>(this.apiUrl).subscribe((data) => {
        this.products = data;
        this.cdr.markForCheck();
      });
      return;
    }

    let params = new HttpParams();
    if (hasSearch) {
      params = params.set('name', this.searchTerm.trim());
    }
    if (hasCategory) {
      params = params.set('categoryId', this.activeCategoryId!);
    }

    this.http.get<Product[]>(`${this.apiUrl}/search`, { params }).subscribe((data) => {
      this.products = data;
      this.cdr.markForCheck();
    });
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.fetchProducts(), 400);
  }

  selectCategory(categoryId: number | null) {
    this.router.navigate(['/shop'], {
      queryParams: categoryId ? { categoryId } : {},
    });
  }

  addToCart(product: Product) {
    this.cart.addToCart(
      { id: product.id, name: product.name, price: product.price, quantity: product.quantity },
      1,
    );
  }

  toggleFavorite(productId: number, productName: string, event: Event) {
    event.stopPropagation();
    this.favorites.toggle(productId, productName);
  }

  isFavorite(productId: number): boolean {
    return this.favorites.isFavorite(productId);
  }

  goToCart() {
    this.router.navigate(['/shop/cart']);
  }
}
