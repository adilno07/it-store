import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CustomerAuth } from '../../services/customer-auth';
import { Toast } from '../../services/toast';

@Component({
  selector: 'app-customer-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './customer-register.html',
  styleUrl: './customer-register.css',
})
export class CustomerRegister {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  phone: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private customerAuth: CustomerAuth,
    private router: Router,
    private toast: Toast,
  ) {}

  onSubmit() {
    this.errorMessage = '';

    if (
      !this.firstName.trim() ||
      !this.lastName.trim() ||
      !this.email.trim() ||
      !this.password.trim()
    ) {
      this.errorMessage = 'Merci de remplir tous les champs obligatoires.';
      return;
    }

    this.customerAuth
      .register({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        password: this.password,
        phone: this.phone,
      })
      .subscribe({
        next: () => {
          this.toast.success('Compte créé avec succès, vous êtes connecté(e).');
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.errorMessage = err.error || 'Erreur lors de la création du compte.';
        },
      });
  }
}
