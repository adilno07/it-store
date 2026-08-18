import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Cart } from '../../services/cart';

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
  quantity: number;
  imageUrl: string | null;
  brand: Brand | null;
  category: Category | null;
}

interface Slide {
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
  link: string;
}

interface CategoryDisplay extends Category {
  image: string;
}

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  categories: CategoryDisplay[] = [];
  popularProducts: Product[] = [];
  favorites = new Set<number>();

  baseUrl = 'http://localhost:8080';
  private productsUrl = 'http://localhost:8080/api/public/products';
  private categoriesUrl = 'http://localhost:8080/api/public/categories';

  // --- Slider ---
  slides: Slide[] = [
    {
      image:
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1600&q=80',
      title: "Trouvez l'ordinateur qui vous correspond",
      subtitle: 'Des performances puissantes, un design élégant, pour tous vos besoins.',
      buttonText: 'Découvrir',
      link: '/shop',
    },
    {
      image:
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80',
      title: 'Votre expérience gaming commence ici',
      subtitle: 'Setups gaming, périphériques haute performance et plus encore.',
      buttonText: 'Voir les produits',
      link: '/shop',
    },
    {
      image:
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1600&q=80',
      title: 'Les accessoires pour compléter votre setup',
      subtitle: 'Claviers, souris, casques — tout pour parfaire votre installation.',
      buttonText: 'Découvrir les accessoires',
      link: '/shop',
    },
  ];

  currentSlide = 0;
  private autoplayInterval: any;

  // Images génériques pour habiller les catégories (le modèle Category
  // n'a pas encore de champ image, donc on associe une photo par index)
  private categoryImages = [
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=500&q=80',
  ];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    public cart: Cart,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadPopularProducts();
    this.startAutoplay();
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  // --- Data loading ---
  loadCategories() {
    this.http.get<Category[]>(this.categoriesUrl).subscribe({
      next: (data) => {
        this.categories = data.slice(0, 6).map((cat, index) => ({
          ...cat,
          image: this.categoryImages[index % this.categoryImages.length],
        }));
        this.cdr.markForCheck();
      },
      error: () => {
        this.categories = [];
        this.cdr.markForCheck();
      },
    });
  }

  loadPopularProducts() {
    this.http.get<Product[]>(this.productsUrl).subscribe((data) => {
      this.popularProducts = data.sort((a, b) => b.id - a.id).slice(0, 8);
      this.cdr.markForCheck();
    });
  }

  // --- Slider logic ---
  startAutoplay() {
    this.autoplayInterval = setInterval(() => this.nextSlide(), 5000);
  }

  stopAutoplay() {
    if (this.autoplayInterval) clearInterval(this.autoplayInterval);
  }

  resetAutoplay() {
    this.stopAutoplay();
    this.startAutoplay();
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.cdr.markForCheck();
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.cdr.markForCheck();
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.resetAutoplay();
    this.cdr.markForCheck();
  }

  onManualNav(direction: 'next' | 'prev') {
    direction === 'next' ? this.nextSlide() : this.prevSlide();
    this.resetAutoplay();
  }

  // --- Actions ---
  addToCart(product: Product) {
    this.cart.addToCart(
      { id: product.id, name: product.name, price: product.price, quantity: product.quantity },
      1,
    );
  }

  toggleFavorite(productId: number, event: Event) {
    event.stopPropagation();
    if (this.favorites.has(productId)) {
      this.favorites.delete(productId);
    } else {
      this.favorites.add(productId);
    }
  }

  isFavorite(productId: number): boolean {
    return this.favorites.has(productId);
  }

  browseByCategory(categoryId: number) {
    this.router.navigate(['/shop'], { queryParams: { categoryId } });
  }

  goToShop() {
    this.router.navigate(['/shop']);
  }

  navigateTo(link: string) {
    this.router.navigateByUrl(link);
  }
}
