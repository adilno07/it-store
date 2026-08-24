import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Toast } from '../../services/toast';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
}

interface NewCustomer {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
}

@Component({
  selector: 'app-customer-list',
  imports: [FormsModule],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.css',
})
export class CustomerList implements OnInit {
  customers: Customer[] = [];

  newCustomer: NewCustomer = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
  };

  editingCustomer: Customer | null = null;

  // --- Modale de suppression ---
  deleteModalOpen = false;
  customerToDelete: Customer | null = null;

  private apiUrl = 'http://localhost:8080/api/customers';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private toast: Toast,
  ) {}

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.http.get<Customer[]>(this.apiUrl).subscribe((data) => {
      this.customers = data;
      this.cdr.markForCheck();
    });
  }

  createCustomer() {
    const phonePattern = /^(0[5-7][0-9]{8}|\+212[5-7][0-9]{8})$/;

    if (!this.newCustomer.firstName.trim() || !this.newCustomer.lastName.trim()) {
      this.toast.error('Merci de remplir le prénom et le nom.');
      return;
    }

    if (!phonePattern.test(this.newCustomer.phone.trim())) {
      this.toast.error(
        'Numéro de téléphone invalide. Format attendu : 0612345678 ou +212612345678',
      );
      return;
    }

    this.http.post<Customer>(this.apiUrl, this.newCustomer).subscribe(() => {
      this.loadCustomers();
      this.resetForm();
      this.toast.success('Client créé avec succès.');
    });
  }

  startEdit(customer: Customer) {
    this.editingCustomer = { ...customer };
  }

  cancelEdit() {
    this.editingCustomer = null;
  }

  updateCustomer() {
    if (!this.editingCustomer) return;

    const phonePattern = /^(0[5-7][0-9]{8}|\+212[5-7][0-9]{8})$/;

    if (!this.editingCustomer.firstName.trim() || !this.editingCustomer.lastName.trim()) {
      this.toast.error('Merci de remplir le prénom et le nom.');
      return;
    }

    if (!phonePattern.test(this.editingCustomer.phone.trim())) {
      this.toast.error(
        'Numéro de téléphone invalide. Format attendu : 0612345678 ou +212612345678',
      );
      return;
    }

    this.http
      .put<Customer>(`${this.apiUrl}/${this.editingCustomer.id}`, this.editingCustomer)
      .subscribe(() => {
        this.loadCustomers();
        this.editingCustomer = null;
        this.toast.success('Client modifié avec succès.');
      });
  }

  // --- Suppression via modale ---
  openDeleteModal(customer: Customer) {
    this.customerToDelete = customer;
    this.deleteModalOpen = true;
  }

  closeDeleteModal() {
    this.deleteModalOpen = false;
    this.customerToDelete = null;
  }

  confirmDelete() {
    if (!this.customerToDelete) return;

    this.http
      .delete(`${this.apiUrl}/${this.customerToDelete.id}`, { responseType: 'text' })
      .subscribe({
        next: () => {
          this.loadCustomers();
          this.toast.success('Client supprimé.');
          this.closeDeleteModal();
        },
        error: (err) => {
          this.toast.error(err.error || 'Erreur lors de la suppression du client.');
          this.closeDeleteModal();
        },
      });
  }

  resetForm() {
    this.newCustomer = { firstName: '', lastName: '', phone: '', email: '', address: '' };
  }
}
