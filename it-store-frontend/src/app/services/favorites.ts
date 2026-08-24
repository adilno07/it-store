import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CustomerAuth } from './customer-auth';
import { Toast } from './toast';

interface FavoriteProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  category: { id: number; name: string } | null;
}

interface FavoriteEntry {
  id: number;
  product: FavoriteProduct;
}

@Injectable({
  providedIn: 'root',
})
export class Favorites {
  private http = inject(HttpClient);
  private customerAuth = inject(CustomerAuth);
  private toast = inject(Toast);

  private apiUrl = 'http://localhost:8080/api/public/favorites';

  // Ensemble des IDs produits en favoris, pour un accès rapide (cœur plein/vide)
  favoriteProductIds = signal<Set<number>>(new Set());
  favoriteEntries = signal<FavoriteEntry[]>([]);

  loadFavorites() {
    const customerId = this.customerAuth.getCustomerId();
    if (!customerId) {
      this.favoriteProductIds.set(new Set());
      this.favoriteEntries.set([]);
      return;
    }

    this.http.get<FavoriteEntry[]>(`${this.apiUrl}/${customerId}`).subscribe({
      next: (data) => {
        this.favoriteEntries.set(data);
        this.favoriteProductIds.set(new Set(data.map((f) => f.product.id)));
      },
      error: () => {
        this.favoriteEntries.set([]);
        this.favoriteProductIds.set(new Set());
      },
    });
  }

  isFavorite(productId: number): boolean {
    return this.favoriteProductIds().has(productId);
  }

  toggle(productId: number, productName: string) {
    const customerId = this.customerAuth.getCustomerId();

    if (!customerId) {
      this.toast.error('Connectez-vous pour ajouter des favoris.');
      return;
    }

    if (this.isFavorite(productId)) {
      this.http
        .delete(`${this.apiUrl}?customerId=${customerId}&productId=${productId}`, {
          responseType: 'text',
        })
        .subscribe({
          next: () => {
            const current = new Set(this.favoriteProductIds());
            current.delete(productId);
            this.favoriteProductIds.set(current);
            this.favoriteEntries.set(
              this.favoriteEntries().filter((f) => f.product.id !== productId),
            );
            this.toast.info(`${productName} retiré des favoris.`);
          },
          error: () => {
            this.toast.error('Erreur lors de la suppression du favori.');
          },
        });
    } else {
      this.http
        .post(`${this.apiUrl}?customerId=${customerId}&productId=${productId}`, {})
        .subscribe({
          next: () => {
            const current = new Set(this.favoriteProductIds());
            current.add(productId);
            this.favoriteProductIds.set(current);
            this.toast.success(`${productName} ajouté aux favoris.`);
          },
          error: () => {
            this.toast.error("Erreur lors de l'ajout aux favoris.");
          },
        });
    }
  }

  clear() {
    this.favoriteProductIds.set(new Set());
    this.favoriteEntries.set([]);
  }
}
