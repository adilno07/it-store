import { Component } from '@angular/core';
import { Toast } from '../../services/toast';

@Component({
  selector: 'app-toast-container',
  imports: [],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.css',
})
export class ToastContainer {
  constructor(public toast: Toast) {}
}
