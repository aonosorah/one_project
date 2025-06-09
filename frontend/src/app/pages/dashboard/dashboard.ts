import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  users: any[] = [];
 currentUserId: string = '';
  constructor(private http: HttpClient, private router: Router) {}


  ngOnInit() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (user && user.id) {
        this.currentUserId = user.id;
      } else {
        console.warn('No user ID found in localStorage');
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
    }
  }
  goToEditUser(userId: string) {
  this.router.navigate(['/edit-user', userId]);
}

logoff() {
  localStorage.removeItem('user');
  this.router.navigate(['/login']); 
}



}
