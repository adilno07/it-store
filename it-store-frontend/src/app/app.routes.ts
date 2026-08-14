import { Routes } from '@angular/router';
import { ProductList } from './components/product-list/product-list';
import { CategoryList } from './components/category-list/category-list';
import { BrandList } from './components/brand-list/brand-list';
import { StockList } from './components/stock-list/stock-list';
import { CustomerList } from './components/customer-list/customer-list';
import { SaleList } from './components/sale-list/sale-list';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Layout } from './components/layout/layout';
import { authGuard } from './guards/auth-guard';
import { ShopCatalog } from './components/shop-catalog/shop-catalog';
import { ShopCart } from './components/shop-cart/shop-cart';
import { ShopCheckout } from './components/shop-checkout/shop-checkout';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'shop', component: ShopCatalog },
  { path: 'shop/cart', component: ShopCart },
  { path: 'shop/checkout', component: ShopCheckout },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'products', component: ProductList },
      { path: 'categories', component: CategoryList },
      { path: 'brands', component: BrandList },
      { path: 'stock', component: StockList },
      { path: 'customers', component: CustomerList },
      { path: 'sales', component: SaleList },
      { path: 'register', component: Register },
    ],
  },
];
