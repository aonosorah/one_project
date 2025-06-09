import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';      
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-register',
 imports: [FormsModule, CommonModule],  
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  errorMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    if (!this.username || !this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.http.post<any>('http://localhost:3000/users', {
      username: this.username,
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res) => {
        localStorage.setItem('user', JSON.stringify(res.user)); 
        this.router.navigate(['/login']); 
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Registration failed';
      }
    });
  }
    goBack() {
  this.router.navigate(['/login']);
}
}
