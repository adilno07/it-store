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
import { PublicLayout } from './components/public-layout/public-layout';
import { Home } from './components/home/home';
import { CustomerLogin } from './components/customer-login/customer-login';
import { CustomerRegister } from './components/customer-register/customer-register';
import { MyFavorites } from './components/my-favorites/my-favorites';
import { About } from './components/about/about';

export const routes: Routes = [
  { path: 'login', component: Login, data: { title: 'IT Store — Connexion' } },

  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', component: Home, data: { title: 'IT Store — Accueil' } },
      { path: 'shop', component: ShopCatalog, data: { title: 'IT Store — Produits' } },
      { path: 'shop/cart', component: ShopCart, data: { title: 'IT Store — Panier' } },
      { path: 'shop/checkout', component: ShopCheckout, data: { title: 'IT Store — Commande' } },
      { path: 'account/login', component: CustomerLogin, data: { title: 'IT Store — Connexion' } },
      {
        path: 'account/register',
        component: CustomerRegister,
        data: { title: 'IT Store — Créer un compte' },
      },
      {
        path: 'account/favorites',
        component: MyFavorites,
        data: { title: 'IT Store — Mes favoris' },
      },
      { path: 'about', component: About, data: { title: 'IT Store — À propos' } },
    ],
  },

  {
    path: 'admin',
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
