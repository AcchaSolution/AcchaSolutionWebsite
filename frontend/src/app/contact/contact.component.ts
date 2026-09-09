import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // FormsModule import karna zaroori hai

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule], // FormsModule zaroori hai [(ngModel)] ke liye
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  selectedUser: string = 'Owner'; // Default selection
  selectedIntent: string = 'Sell';
  
  // Registration data object
  userData = { 
    name: '', 
    email: '', 
    password: '', 
    experience: '', 
    reraId: '', 
    phone: '' 
  };

  // Yeh function missing tha!
  onRegister() {
    console.log("User Data:", this.userData);
    console.log("User Type:", this.selectedUser);
    console.log("Intent:", this.selectedIntent);
    
    // Yahan aage ka code likhein (Firebase save logic)
    alert("Registration button is working! Form data is ready.");
  }
}