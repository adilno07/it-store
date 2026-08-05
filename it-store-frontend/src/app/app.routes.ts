import { Routes } from '@angular/router';
import { ProductList } from './components/product-list/product-list';
import { CategoryList } from './components/category-list/category-list';
import { BrandList } from './components/brand-list/brand-list';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'products', component: ProductList },
  { path: 'categories', component: CategoryList },
  { path: 'brands', component: BrandList },
];
