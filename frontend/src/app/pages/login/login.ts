import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';      
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-login',
  standalone: true, 
  imports: [FormsModule, CommonModule],  
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
  this.errorMessage = '';

  if (!this.email || !this.password) {
    this.errorMessage = 'Please fill in all fields.';
    return;
  }

  this.http
    .post<{ success: boolean; message?: string; token?: string; user?: any }>(
      'http://localhost:3000/login',
      { email: this.email, password: this.password }
    )
    .subscribe({
      next: (res) => {
        if (res.success && res.user) {
      console.log(res.user)
          localStorage.setItem('user', JSON.stringify(res.user));

          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = res.message || 'Invalid login credentials';
        }
      },
      error: () => {
        this.errorMessage = 'Server error. Try again later.';
      },
    });
}

  createUSer() {
  this.router.navigate(['/register']);
}


}
