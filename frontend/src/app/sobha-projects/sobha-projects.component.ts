import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sobha-projects',
  standalone: true,
  imports: [CommonModule , RouterLink],
  templateUrl: './sobha-projects.component.html',
  styleUrls: ['./sobha-projects.component.css']
})
export class SobhaProjectsComponent {

  // =====================================================
  // SOBHA PROJECTS
  // =====================================================

  projects: any[] = [

    {
      name: 'SOBHA OneWorld',
      location: 'Greater Whitefield',
      city: 'Bangalore',
      configuration: '2, 3 & 4 BHK',
      status: 'New Launch',
      type: 'Residential'
    },

    {
      name: 'SOBHA Windsor',
      location: 'Whitefield',
      city: 'Bangalore',
      configuration: '3 & 4 BHK',
      status: 'Ongoing',
      type: 'Residential'
    },

    {
      name: 'SOBHA Neopolis',
      location: 'Panathur',
      city: 'Bangalore',
      configuration: '3 & 4 BHK',
      status: 'New Launch',
      type: 'Residential'
    },

    {
      name: 'SOBHA Ayana',
      location: 'Panathur',
      city: 'Bangalore',
      configuration: '3 BHK',
      status: 'Ongoing',
      type: 'Residential'
    },

    {
      name: 'SOBHA Infinia',
      location: 'Koramangala',
      city: 'Bangalore',
      configuration: '3 & 4 BHK',
      status: 'Ready / Ongoing',
      type: 'Residential'
    },

    {
      name: 'SOBHA Altair',
      location: 'Sarjapur Road',
      city: 'Bangalore',
      configuration: '3 & 4 BHK',
      status: 'New Launch',
      type: 'Residential'
    }

  ];


  // =====================================================
  // PAGE TITLE
  // =====================================================

  pageTitle: string = 'SOBHA Projects';

  pageSubtitle: string =
    'Explore residential projects by SOBHA in Bangalore';


  // =====================================================
  // PROJECT LOCATION FILTER
  // =====================================================

  selectedLocation: string = 'All';


  // =====================================================
  // FILTER PROJECTS
  // =====================================================

  getFilteredProjects(): any[] {

    if (this.selectedLocation === 'All') {

      return this.projects;

    }

    return this.projects.filter(
      (project: any) =>
        project.location
          .toLowerCase()
          .includes(
            this.selectedLocation.toLowerCase()
          )
    );

  }


  // =====================================================
  // LOCATION SELECT
  // =====================================================

  selectLocation(location: string): void {

    this.selectedLocation = location;

  }


  // // =====================================================
// PROJECT CLICK
// =====================================================

openProject(project: any): void {

  console.log(
    'SOBHA PROJECT SELECTED:',
    project
  );

  if (project.name === 'SOBHA OneWorld') {

    console.log(
      'SOBHA OneWorld selected'
    );

    // Next step mein yahan
    // OneWorld detail page ka route add karenge.
  }

}

}