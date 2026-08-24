import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CustomerAuth } from '../../services/customer-auth';
import { Toast } from '../../services/toast';

@Component({
  selector: 'app-customer-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './customer-login.html',
  styleUrl: './customer-login.css',
})
export class CustomerLogin {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private customerAuth: CustomerAuth,
    private router: Router,
    private toast: Toast,
  ) {}

  onSubmit() {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Merci de remplir tous les champs.';
      return;
    }

    this.customerAuth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.toast.success('Connexion réussie.');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.errorMessage = err.error || 'Email ou mot de passe incorrect.';
      },
    });
  }
}
