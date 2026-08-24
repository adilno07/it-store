import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Toast } from '../../services/toast';

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
  source: string;
  status: string;
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

  // --- Modales de confirmation ---
  confirmOrderModalOpen = false;
  orderToConfirm: SaleView | null = null;

  cancelOrderModalOpen = false;
  orderToCancel: SaleView | null = null;

  // --- Recherche + pagination historique ---
  historySearchTerm: string = '';
  historyPage = 1;
  historyPageSize = 5;

  private customersUrl = 'http://localhost:8080/api/customers';
  private productsUrl = 'http://localhost:8080/api/products';
  private salesUrl = 'http://localhost:8080/api/sales';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private toast: Toast,
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

  get pendingOrders(): SaleView[] {
    return this.sales.filter((s) => s.status === 'PENDING');
  }

  get confirmedSales(): SaleView[] {
    const base = this.sales.filter((s) => s.status !== 'PENDING');

    const term = this.historySearchTerm.trim().toLowerCase();
    if (!term) return base;

    return base.filter((sale) => {
      const customerName = sale.customer
        ? `${sale.customer.firstName} ${sale.customer.lastName}`.toLowerCase()
        : 'client anonyme';

      const matchesCustomer = customerName.includes(term);
      const matchesProduct = sale.items.some((item) =>
        item.product.name.toLowerCase().includes(term),
      );

      return matchesCustomer || matchesProduct;
    });
  }

  get paginatedSales(): SaleView[] {
    const start = (this.historyPage - 1) * this.historyPageSize;
    return this.confirmedSales.slice(start, start + this.historyPageSize);
  }

  get totalHistoryPages(): number {
    return Math.max(1, Math.ceil(this.confirmedSales.length / this.historyPageSize));
  }

  goToHistoryPage(page: number) {
    if (page < 1 || page > this.totalHistoryPages) return;
    this.historyPage = page;
  }

  onHistorySearchChange() {
    this.historyPage = 1;
  }

  // --- Confirmation de commande via modale ---
  openConfirmOrderModal(order: SaleView) {
    this.orderToConfirm = order;
    this.confirmOrderModalOpen = true;
  }

  closeConfirmOrderModal() {
    this.confirmOrderModalOpen = false;
    this.orderToConfirm = null;
  }

  confirmOrder() {
    if (!this.orderToConfirm) return;

    this.http.put<SaleView>(`${this.salesUrl}/${this.orderToConfirm.id}/confirm`, {}).subscribe({
      next: () => {
        this.loadSales();
        this.loadProducts();
        this.toast.success('Commande confirmée, le stock a été déduit.');
        this.closeConfirmOrderModal();
      },
      error: (err) => {
        this.toast.error(err.error || 'Erreur lors de la confirmation.');
        this.closeConfirmOrderModal();
      },
    });
  }

  // --- Annulation de commande via modale ---
  openCancelOrderModal(order: SaleView) {
    this.orderToCancel = order;
    this.cancelOrderModalOpen = true;
  }

  closeCancelOrderModal() {
    this.cancelOrderModalOpen = false;
    this.orderToCancel = null;
  }

  cancelOrder() {
    if (!this.orderToCancel) return;

    this.http.put<SaleView>(`${this.salesUrl}/${this.orderToCancel.id}/cancel`, {}).subscribe({
      next: () => {
        this.loadSales();
        this.toast.success('Commande annulée.');
        this.closeCancelOrderModal();
      },
      error: (err) => {
        this.toast.error(err.error || "Erreur lors de l'annulation.");
        this.closeCancelOrderModal();
      },
    });
  }

  get cartTotal(): number {
    return this.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  addToCart() {
    if (!this.selectedProductId || this.selectedQuantity <= 0) {
      this.toast.error('Choisissez un produit et une quantité valide.');
      return;
    }

    const product = this.products.find((p) => p.id === this.selectedProductId);
    if (!product) return;

    const existing = this.cart.find((item) => item.product.id === product.id);
    const alreadyInCart = existing ? existing.quantity : 0;

    if (alreadyInCart + this.selectedQuantity > product.quantity) {
      this.toast.error(
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
      this.toast.error('Le panier est vide.');
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
        this.toast.success('Vente enregistrée avec succès.');
      },
      error: (err) => {
        this.toast.error(err.error || 'Erreur lors de la création de la vente.');
      },
    });
  }
}
