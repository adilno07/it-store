import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

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

  private apiUrl = 'http://localhost:8080/api/brands';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
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
      alert('Le nom de la marque est obligatoire.');
      return;
    }

    this.http.post<Brand>(this.apiUrl, { name: this.newBrandName }).subscribe(() => {
      this.loadBrands();
      this.newBrandName = '';
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
      alert('Le nom de la marque est obligatoire.');
      return;
    }

    this.http
      .put<Brand>(`${this.apiUrl}/${this.editingBrand.id}`, this.editingBrand)
      .subscribe(() => {
        this.loadBrands();
        this.editingBrand = null;
      });
  }

  deleteBrand(id: number) {
    if (!confirm('Supprimer cette marque ? Les produits liés perdront cette marque.')) return;

    this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
      this.loadBrands();
    });
  }
}
