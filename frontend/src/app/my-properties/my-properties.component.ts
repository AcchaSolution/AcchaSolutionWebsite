import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { PropertyService } from '../services/property.service';

@Component({
  selector: 'app-my-properties',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-properties.component.html',
  styleUrl: './my-properties.component.css'
})
export class MyPropertiesComponent implements OnInit {

  properties: any[] = [];

  loading = true;

  constructor(
    private propertyService: PropertyService,
    private router: Router
  ) {}

  ngOnInit(): void {

    const userEmail =
      localStorage.getItem('userEmail');

    this.propertyService
      .getProperties()
      .subscribe({

        next: (allProperties) => {

          this.properties =
            allProperties.filter(
              (property: any) =>
                property.postedByEmail === userEmail
            );

          this.loading = false;
        },

        error: (error) => {

          console.error(
            'MY PROPERTIES ERROR',
            error
          );

          this.loading = false;
        }

      });

  }

  editProperty(property: any): void {

    const propertyId =
      property.uniqueId ||
      property.id ||
      property._id;

    this.router.navigate(
      ['/post-property'],
      {
        queryParams: {
          edit: propertyId
        }
      }
    );

  }

}