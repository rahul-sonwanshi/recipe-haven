import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'signup',
  imports: [FormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  username = '';
  password = '';
  errorMessage = '';
  constructor(private router: Router, private authService: AuthService) {}

  signup() {
    this.authService.signup(this.username, this.password).subscribe(
      (response) => {
        this.router.navigate(['/login']);
      },
      (error) => {
        this.errorMessage = error.error.message || 'Signup failed.';
      }
    );
  }
}
