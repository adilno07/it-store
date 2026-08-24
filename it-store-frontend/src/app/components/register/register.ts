import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Toast } from '../../services/toast';

interface AppUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  // --- Formulaire de création ---
  email: string = '';
  password: string = '';
  firstName: string = '';
  lastName: string = '';
  role: string = 'EMPLOYEE';

  // --- Liste + édition ---
  users: AppUser[] = [];
  editingUser: AppUser | null = null;

  // --- Modale de suppression ---
  deleteModalOpen = false;
  userToDelete: AppUser | null = null;

  private usersApiUrl = 'http://localhost:8080/api/users';

  constructor(
    private authService: Auth,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private toast: Toast,
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.http.get<AppUser[]>(this.usersApiUrl).subscribe((data) => {
      this.users = data;
      this.cdr.markForCheck();
    });
  }

  onSubmit() {
    if (
      !this.email.trim() ||
      !this.password.trim() ||
      !this.firstName.trim() ||
      !this.lastName.trim()
    ) {
      this.toast.error('Merci de remplir tous les champs.');
      return;
    }

    this.authService
      .register({
        email: this.email,
        password: this.password,
        firstName: this.firstName,
        lastName: this.lastName,
        role: this.role,
      })
      .subscribe({
        next: () => {
          this.toast.success(
            `Compte créé avec succès pour ${this.firstName} ${this.lastName} (${this.role}).`,
          );
          this.resetForm();
          this.loadUsers();
        },
        error: (err) => {
          this.toast.error(err.error || 'Erreur lors de la création du compte.');
        },
      });
  }

  resetForm() {
    this.email = '';
    this.password = '';
    this.firstName = '';
    this.lastName = '';
    this.role = 'EMPLOYEE';
  }

  startEdit(user: AppUser) {
    this.editingUser = { ...user };
  }

  cancelEdit() {
    this.editingUser = null;
  }

  updateUser() {
    if (!this.editingUser) return;

    if (!this.editingUser.firstName.trim() || !this.editingUser.lastName.trim()) {
      this.toast.error('Merci de remplir le prénom et le nom.');
      return;
    }

    const payload = {
      firstName: this.editingUser.firstName,
      lastName: this.editingUser.lastName,
      role: this.editingUser.role,
    };

    this.http.put<AppUser>(`${this.usersApiUrl}/${this.editingUser.id}`, payload).subscribe(() => {
      this.loadUsers();
      this.editingUser = null;
      this.toast.success('Utilisateur modifié avec succès.');
    });
  }

  // --- Suppression via modale ---
  openDeleteModal(user: AppUser) {
    this.userToDelete = user;
    this.deleteModalOpen = true;
  }

  closeDeleteModal() {
    this.deleteModalOpen = false;
    this.userToDelete = null;
  }

  confirmDelete() {
    if (!this.userToDelete) return;

    this.http
      .delete(`${this.usersApiUrl}/${this.userToDelete.id}`, { responseType: 'text' })
      .subscribe({
        next: () => {
          this.loadUsers();
          this.toast.success('Utilisateur supprimé.');
          this.closeDeleteModal();
        },
        error: (err) => {
          this.toast.error(err.error || "Erreur lors de la suppression de l'utilisateur.");
          this.closeDeleteModal();
        },
      });
  }
}
