import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Toast } from '../../services/toast';

interface Brand {
  id: number;
  name: string;
}

@Component({
  selector: 'app-brand-list',
  imports: [FormsModule],
  templateUrl: './brand-list.html',
  styleUrl: './brand-list.css',
})
export class BrandList implements OnInit {
  brands: Brand[] = [];

  newBrandName: string = '';
  editingBrand: Brand | null = null;

  // --- Modale de suppression ---
  deleteModalOpen = false;
  brandToDelete: Brand | null = null;

  private apiUrl = 'http://localhost:8080/api/brands';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private toast: Toast,
  ) {}

  ngOnInit() {
    this.loadBrands();
  }

  loadBrands() {
    this.http.get<Brand[]>(this.apiUrl).subscribe((data) => {
      this.brands = data;
      this.cdr.markForCheck();
    });
  }

  createBrand() {
    if (!this.newBrandName.trim()) {
      this.toast.error('Le nom de la marque est obligatoire.');
      return;
    }

    this.http.post<Brand>(this.apiUrl, { name: this.newBrandName }).subscribe(() => {
      this.loadBrands();
      this.newBrandName = '';
      this.toast.success('Marque créée avec succès.');
    });
  }

  startEdit(brand: Brand) {
    this.editingBrand = { ...brand };
  }

  cancelEdit() {
    this.editingBrand = null;
  }

  updateBrand() {
    if (!this.editingBrand || !this.editingBrand.name.trim()) {
      this.toast.error('Le nom de la marque est obligatoire.');
      return;
    }

    this.http
      .put<Brand>(`${this.apiUrl}/${this.editingBrand.id}`, this.editingBrand)
      .subscribe(() => {
        this.loadBrands();
        this.editingBrand = null;
        this.toast.success('Marque modifiée avec succès.');
      });
  }

  // --- Suppression via modale ---
  openDeleteModal(brand: Brand) {
    this.brandToDelete = brand;
    this.deleteModalOpen = true;
  }

  closeDeleteModal() {
    this.deleteModalOpen = false;
    this.brandToDelete = null;
  }

  confirmDelete() {
    if (!this.brandToDelete) return;

    this.http
      .delete(`${this.apiUrl}/${this.brandToDelete.id}`, { responseType: 'text' })
      .subscribe({
        next: () => {
          this.loadBrands();
          this.toast.success('Marque supprimée.');
          this.closeDeleteModal();
        },
        error: (err) => {
          this.toast.error(err.error || 'Erreur lors de la suppression de la marque.');
          this.closeDeleteModal();
        },
      });
  }
}
