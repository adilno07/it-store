import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

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

  private apiUrl = 'http://localhost:8080/api/categories';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
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
      alert('Le nom de la catégorie est obligatoire.');
      return;
    }

    this.http.post<Category>(this.apiUrl, this.newCategory).subscribe(() => {
      this.loadCategories();
      this.resetForm();
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
      alert('Le nom de la catégorie est obligatoire.');
      return;
    }

    this.http
      .put<Category>(`${this.apiUrl}/${this.editingCategory.id}`, this.editingCategory)
      .subscribe(() => {
        this.loadCategories();
        this.editingCategory = null;
      });
  }

  deleteCategory(id: number) {
    if (!confirm('Supprimer cette catégorie ? Les produits liés perdront cette catégorie.')) return;

    this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
      this.loadCategories();
    });
  }

  resetForm() {
    this.newCategory = { name: '', description: '' };
  }
}
