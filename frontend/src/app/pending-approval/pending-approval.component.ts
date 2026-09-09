import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pending-approval',
  standalone: true,
  imports: [],
  templateUrl: './pending-approval.component.html',
  styleUrl: './pending-approval.component.css'
})
export class PendingApprovalComponent {


  constructor(private router: Router) {} // Constructor mein Router inject karein

  goHome() {
    this.router.navigate(['/']); // Ye function ab home page par le jayega
  }
}
