import { Component } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';      
import { CommonModule } from '@angular/common'; 
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })

@Component({
  selector: 'app-edit-user',
  imports: [FormsModule, CommonModule],
  templateUrl: './edit-user.html',
  styleUrl: './edit-user.css'
})


export class EditUserComponent {
  userId: string = '';
  username = '';
  email = '';
  password = ''; 
  errorMessage = '';
 constructor(
  private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
 ) {}

ngOnInit(): void {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (user && user.id) {
        this.userId = user.id;
        this.username = user.username;
        this.email = user.email;
      } else {
        this.errorMessage = 'User not found in localStorage.';
      }
    } catch (err) {
      this.errorMessage = 'Failed to load user from localStorage.';
      console.error(err);
    }
  }

 updateUser(id: string, data: { username: string; email: string; password?: string }) {
    return this.http.put(`http://localhost:3000/users/${id}`, data);
  
}

goBack() {
  this.router.navigate(['/dashboard']);
}

onSubmit() {
  if (!this.username || !this.email) {
    this.errorMessage = 'Username and email are required';
    return;
  }

  this.updateUser(this.userId, {
    username: this.username,
    email: this.email,
    password: this.password ? this.password : undefined,
  }).subscribe({
    next: () => {

      const updatedUser = {
        id: this.userId,
        username: this.username,
        email: this.email,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

    
      this.router.navigate(['/dashboard']);
    },
    error: (err) => {
      this.errorMessage = err.error?.message || 'Failed to update user';
    }
  });
}

deleteAccount() {
  if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    return;
  }

  this.http.delete(`http://localhost:3000/users/${this.userId}`)
    .subscribe({
      next: () => {
        localStorage.removeItem('user');
        this.router.navigate(['/login']); 
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to delete account';
      }
    });
}

}

