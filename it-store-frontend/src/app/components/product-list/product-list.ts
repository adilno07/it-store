import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Category {
  id: number;
  name: string;
  description: string;
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
  brand: Brand | null;
  category: Category | null;
}

interface NewProduct {
  name: string;
  description: string;
  price: number | null;
  brandId: number | null;
  categoryId: number | null;
}

interface SearchFilters {
  name: string;
  categoryId: number | null;
  brandId: number | null;
  minPrice: number | null;
  maxPrice: number | null;
}

@Component({
  selector: 'app-product-list',
  imports: [FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  brands: Brand[] = [];

  newProduct: NewProduct = {
    name: '',
    description: '',
    price: null,
    brandId: null,
    categoryId: null,
  };

  editingProduct: Product | null = null;
  editingCategoryId: number | null = null;
  editingBrandId: number | null = null;

  filters: SearchFilters = {
    name: '',
    categoryId: null,
    brandId: null,
    minPrice: null,
    maxPrice: null,
  };

  private apiUrl = 'http://localhost:8080/api/products';
  private categoriesUrl = 'http://localhost:8080/api/categories';
  private brandsUrl = 'http://localhost:8080/api/brands';
  private searchTimeout: any;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
    this.loadBrands();
  }

  loadProducts() {
    this.http.get<Product[]>(this.apiUrl).subscribe((data) => {
      this.products = data;
      this.cdr.markForCheck();
    });
  }

  loadCategories() {
    this.http.get<Category[]>(this.categoriesUrl).subscribe((data) => {
      this.categories = data;
      this.cdr.markForCheck();
    });
  }

  loadBrands() {
    this.http.get<Brand[]>(this.brandsUrl).subscribe((data) => {
      this.brands = data;
      this.cdr.markForCheck();
    });
  }

  onFilterChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      const hasActiveFilter =
        this.filters.name.trim() ||
        this.filters.categoryId ||
        this.filters.brandId ||
        this.filters.minPrice ||
        this.filters.maxPrice;

      if (hasActiveFilter) {
        this.search();
      } else {
        this.loadProducts();
      }
    }, 400);
  }

  search() {
    let params = new HttpParams();

    if (this.filters.name.trim()) {
      params = params.set('name', this.filters.name.trim());
    }
    if (this.filters.categoryId) {
      params = params.set('categoryId', this.filters.categoryId);
    }
    if (this.filters.brandId) {
      params = params.set('brandId', this.filters.brandId);
    }
    if (this.filters.minPrice) {
      params = params.set('minPrice', this.filters.minPrice);
    }
    if (this.filters.maxPrice) {
      params = params.set('maxPrice', this.filters.maxPrice);
    }

    this.http.get<Product[]>(`${this.apiUrl}/search`, { params }).subscribe((data) => {
      this.products = data;
      this.cdr.markForCheck();
    });
  }

  resetFilters() {
    this.filters = { name: '', categoryId: null, brandId: null, minPrice: null, maxPrice: null };
    this.loadProducts();
  }

  createProduct() {
    if (!this.newProduct.name.trim() || !this.newProduct.price || this.newProduct.price <= 0) {
      alert('Merci de remplir au moins le nom et un prix valide.');
      return;
    }

    const payload = {
      name: this.newProduct.name,
      description: this.newProduct.description,
      price: this.newProduct.price,
      brand: this.newProduct.brandId ? { id: this.newProduct.brandId } : null,
      category: this.newProduct.categoryId ? { id: this.newProduct.categoryId } : null,
    };

    this.http.post<Product>(this.apiUrl, payload).subscribe(() => {
      this.loadProducts();
      this.resetForm();
    });
  }

  startEdit(product: Product) {
    this.editingProduct = { ...product };
    this.editingCategoryId = product.category ? product.category.id : null;
    this.editingBrandId = product.brand ? product.brand.id : null;
  }

  cancelEdit() {
    this.editingProduct = null;
    this.editingCategoryId = null;
    this.editingBrandId = null;
  }

  updateProduct() {
    if (!this.editingProduct) return;

    if (!this.editingProduct.name.trim() || this.editingProduct.price <= 0) {
      alert('Merci de remplir au moins le nom et un prix valide.');
      return;
    }

    const payload = {
      name: this.editingProduct.name,
      description: this.editingProduct.description,
      price: this.editingProduct.price,
      brand: this.editingBrandId ? { id: this.editingBrandId } : null,
      category: this.editingCategoryId ? { id: this.editingCategoryId } : null,
    };

    this.http.put<Product>(`${this.apiUrl}/${this.editingProduct.id}`, payload).subscribe(() => {
      this.loadProducts();
      this.editingProduct = null;
      this.editingCategoryId = null;
      this.editingBrandId = null;
    });
  }

  deleteProduct(id: number) {
    if (!confirm('Supprimer ce produit ?')) return;

    this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
      this.loadProducts();
    });
  }

  resetForm() {
    this.newProduct = { name: '', description: '', price: null, brandId: null, categoryId: null };
  }
}
