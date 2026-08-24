import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Toast } from '../../services/toast';

interface Category {
  id: number;
  name: string;
  description: string;
}

interface NewCategory {
  name: string;
  description: string;
}

@Component({
  selector: 'app-category-list',
  imports: [FormsModule],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
})
export class CategoryList implements OnInit {
  categories: Category[] = [];

  newCategory: NewCategory = { name: '', description: '' };
  editingCategory: Category | null = null;

  // --- Modale de suppression ---
  deleteModalOpen = false;
  categoryToDelete: Category | null = null;

  private apiUrl = 'http://localhost:8080/api/categories';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private toast: Toast,
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.http.get<Category[]>(this.apiUrl).subscribe((data) => {
      this.categories = data;
      this.cdr.markForCheck();
    });
  }

  createCategory() {
    if (!this.newCategory.name.trim()) {
      this.toast.error('Le nom de la catégorie est obligatoire.');
      return;
    }

    this.http.post<Category>(this.apiUrl, this.newCategory).subscribe(() => {
      this.loadCategories();
      this.resetForm();
      this.toast.success('Catégorie créée avec succès.');
    });
  }

  startEdit(category: Category) {
    this.editingCategory = { ...category };
  }

  cancelEdit() {
    this.editingCategory = null;
  }

  updateCategory() {
    if (!this.editingCategory) return;

    if (!this.editingCategory.name.trim()) {
      this.toast.error('Le nom de la catégorie est obligatoire.');
      return;
    }

    this.http
      .put<Category>(`${this.apiUrl}/${this.editingCategory.id}`, this.editingCategory)
      .subscribe(() => {
        this.loadCategories();
        this.editingCategory = null;
        this.toast.success('Catégorie modifiée avec succès.');
      });
  }

  // --- Suppression via modale ---
  openDeleteModal(category: Category) {
    this.categoryToDelete = category;
    this.deleteModalOpen = true;
  }

  closeDeleteModal() {
    this.deleteModalOpen = false;
    this.categoryToDelete = null;
  }

  confirmDelete() {
    if (!this.categoryToDelete) return;

    this.http
      .delete(`${this.apiUrl}/${this.categoryToDelete.id}`, { responseType: 'text' })
      .subscribe({
        next: () => {
          this.loadCategories();
          this.toast.success('Catégorie supprimée.');
          this.closeDeleteModal();
        },
        error: (err) => {
          this.toast.error(err.error || 'Erreur lors de la suppression de la catégorie.');
          this.closeDeleteModal();
        },
      });
  }

  resetForm() {
    this.newCategory = { name: '', description: '' };
  }
}
