import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Toast } from '../../services/toast';

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
  imageUrl: string | null;
  brand: Brand | null;
  category: Category | null;
}

interface NewProduct {
  name: string;
  description: string;
  price: number | null;
  brandId: number | null;
  categoryId: number | null;
  imageUrl: string | null;
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
    imageUrl: null,
  };

  // --- Modale d'édition ---
  editModalOpen = false;
  editingProduct: Product | null = null;
  editingCategoryId: number | null = null;
  editingBrandId: number | null = null;

  // --- Modale de suppression ---
  deleteModalOpen = false;
  productToDelete: Product | null = null;

  filters: SearchFilters = {
    name: '',
    categoryId: null,
    brandId: null,
    minPrice: null,
    maxPrice: null,
  };

  uploading: boolean = false;

  // --- Pagination liste produits ---
  productsPage = 1;
  productsPageSize = 5;

  private apiUrl = 'http://localhost:8080/api/products';
  private categoriesUrl = 'http://localhost:8080/api/categories';
  private brandsUrl = 'http://localhost:8080/api/brands';
  private uploadUrl = 'http://localhost:8080/api/images/upload';
  baseUrl = 'http://localhost:8080';
  private searchTimeout: any;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private toast: Toast,
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
    this.loadBrands();
  }

  loadProducts() {
    this.http.get<Product[]>(this.apiUrl).subscribe((data) => {
      this.products = data;
      this.productsPage = 1;
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

  // --- Pagination ---
  get paginatedProducts(): Product[] {
    const start = (this.productsPage - 1) * this.productsPageSize;
    return this.products.slice(start, start + this.productsPageSize);
  }

  get totalProductsPages(): number {
    return Math.max(1, Math.ceil(this.products.length / this.productsPageSize));
  }

  goToProductsPage(page: number) {
    if (page < 1 || page > this.totalProductsPages) return;
    this.productsPage = page;
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
      this.productsPage = 1;
      this.cdr.markForCheck();
    });
  }

  resetFilters() {
    this.filters = { name: '', categoryId: null, brandId: null, minPrice: null, maxPrice: null };
    this.loadProducts();
  }

  onFileSelected(event: Event, target: 'new' | 'edit') {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file);

    this.uploading = true;

    this.http.post<{ imageUrl: string }>(this.uploadUrl, formData).subscribe({
      next: (res) => {
        if (target === 'new') {
          this.newProduct.imageUrl = res.imageUrl;
        } else if (this.editingProduct) {
          this.editingProduct.imageUrl = res.imageUrl;
        }
        this.uploading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error("Erreur lors de l'upload de l'image.");
        this.uploading = false;
      },
    });
  }

  createProduct() {
    if (!this.newProduct.name.trim() || !this.newProduct.price || this.newProduct.price <= 0) {
      this.toast.error('Merci de remplir au moins le nom et un prix valide.');
      return;
    }

    const payload = {
      name: this.newProduct.name,
      description: this.newProduct.description,
      price: this.newProduct.price,
      imageUrl: this.newProduct.imageUrl,
      brand: this.newProduct.brandId ? { id: this.newProduct.brandId } : null,
      category: this.newProduct.categoryId ? { id: this.newProduct.categoryId } : null,
    };

    this.http.post<Product>(this.apiUrl, payload).subscribe(() => {
      this.loadProducts();
      this.resetForm();
      this.toast.success('Produit créé avec succès.');
    });
  }

  // --- Édition via modale ---
  openEditModal(product: Product) {
    this.editingProduct = { ...product };
    this.editingCategoryId = product.category ? product.category.id : null;
    this.editingBrandId = product.brand ? product.brand.id : null;
    this.editModalOpen = true;
  }

  closeEditModal() {
    this.editModalOpen = false;
    this.editingProduct = null;
    this.editingCategoryId = null;
    this.editingBrandId = null;
  }

  saveEdit() {
    if (!this.editingProduct) return;

    if (!this.editingProduct.name.trim() || this.editingProduct.price <= 0) {
      this.toast.error('Merci de remplir au moins le nom et un prix valide.');
      return;
    }

    const payload = {
      name: this.editingProduct.name,
      description: this.editingProduct.description,
      price: this.editingProduct.price,
      imageUrl: this.editingProduct.imageUrl,
      brand: this.editingBrandId ? { id: this.editingBrandId } : null,
      category: this.editingCategoryId ? { id: this.editingCategoryId } : null,
    };

    this.http.put<Product>(`${this.apiUrl}/${this.editingProduct.id}`, payload).subscribe(() => {
      this.loadProducts();
      this.closeEditModal();
      this.toast.success('Produit modifié avec succès.');
    });
  }

  // --- Suppression via modale ---
  openDeleteModal(product: Product) {
    this.productToDelete = product;
    this.deleteModalOpen = true;
  }

  closeDeleteModal() {
    this.deleteModalOpen = false;
    this.productToDelete = null;
  }

  confirmDelete() {
    if (!this.productToDelete) return;

    this.http
      .delete(`${this.apiUrl}/${this.productToDelete.id}`, { responseType: 'text' })
      .subscribe({
        next: () => {
          this.loadProducts();
          this.toast.success('Produit supprimé.');
          this.closeDeleteModal();
        },
        error: (err) => {
          this.toast.error(err.error || 'Erreur lors de la suppression du produit.');
          this.closeDeleteModal();
        },
      });
  }

  resetForm() {
    this.newProduct = {
      name: '',
      description: '',
      price: null,
      brandId: null,
      categoryId: null,
      imageUrl: null,
    };
  }
}
