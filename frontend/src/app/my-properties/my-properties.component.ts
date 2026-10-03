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
    String(
      localStorage.getItem('userEmail') || ''
    )
      .trim()
      .toLowerCase();

  this.propertyService
    .getProperties()
    .subscribe({

      next: (allProperties) => {

        const propertiesList =
          Array.isArray(allProperties)
            ? allProperties
            : [];

        this.properties =
          propertiesList.filter(
            (property: any) => {

              const postedByEmail =
                String(
                  property.postedByEmail || ''
                )
                  .trim()
                  .toLowerCase();

              return (
                postedByEmail === userEmail
              );

            }
          );

        console.log(
          'Logged-in User Email:',
          userEmail
        );

        console.log(
          'My Properties:',
          this.properties
        );

        this.loading = false;
      },

      error: (error) => {

        console.error(
          'MY PROPERTIES ERROR',
          error
        );

        this.properties = [];
        this.loading = false;
      }

    });

}

editProperty(property: any): void {

  console.log('PROPERTY DATA:', property);

  const propertyId =
    property.uniqueId ||
    property.id ||
    property._id;

  console.log('EDIT PROPERTY ID:', propertyId);

  this.router.navigate(
    ['/add-property-form'],
    {
      queryParams: {
        edit: propertyId
      }
    }
  );
}


}