import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css']
})
export class ProjectDetailsComponent implements OnInit {

  // =====================================================
  // SELECTED PROJECT
  // =====================================================

  project: any = null;


  // =====================================================
  // ALL PROJECT DATA
  // =====================================================

  projects: any[] = [

    {
      id: 'sobha-oneworld',
      builder: 'SOBHA',
      name: 'SOBHA OneWorld',
      location: 'Greater Whitefield',
      city: 'Bangalore',
      configuration: '2, 3 & 4 BHK',
      status: 'New Launch',
      type: 'Residential'
    },

    {
      id: 'sobha-windsor',
      builder: 'SOBHA',
      name: 'SOBHA Windsor',
      location: 'Whitefield',
      city: 'Bangalore',
      configuration: '3 & 4 BHK',
      status: 'Ongoing',
      type: 'Residential'
    },

    {
      id: 'sobha-neopolis',
      builder: 'SOBHA',
      name: 'SOBHA Neopolis',
      location: 'Panathur',
      city: 'Bangalore',
      configuration: '3 & 4 BHK',
      status: 'New Launch',
      type: 'Residential'
    },

    {
      id: 'sobha-ayana',
      builder: 'SOBHA',
      name: 'SOBHA Ayana',
      location: 'Panathur',
      city: 'Bangalore',
      configuration: '3 BHK',
      status: 'Ongoing',
      type: 'Residential'
    },

    {
      id: 'sobha-infinia',
      builder: 'SOBHA',
      name: 'SOBHA Infinia',
      location: 'Koramangala',
      city: 'Bangalore',
      configuration: '3 & 4 BHK',
      status: 'Ready / Ongoing',
      type: 'Residential'
    },

    {
      id: 'sobha-altair',
      builder: 'SOBHA',
      name: 'SOBHA Altair',
      location: 'Sarjapur Road',
      city: 'Bangalore',
      configuration: '3 & 4 BHK',
      status: 'New Launch',
      type: 'Residential'
    }

  ];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private route: ActivatedRoute,
      private router: Router

  ) {}


  // =====================================================
  // LOAD PROJECT
  // =====================================================

ngOnInit(): void {

  this.route.paramMap.subscribe(params => {

    const id = params.get('id');

    console.log('URL ID:', id);

    if (!id) {
      this.project = null;
      return;
    }

    // =====================================================
    // BUILDER LEVEL
    // =====================================================

    if (id === 'sobha') {

      this.project = {
        isBuilderPage: true,
        builder: 'SOBHA',
        projects: this.projects.filter(
          (item: any) => item.builder === 'SOBHA'
        )
      };

      console.log(
        'SOBHA ALL PROJECTS:',
        this.project.projects
      );

      return;
    }

    // =====================================================
    // INDIVIDUAL PROJECT LEVEL
    // =====================================================

    this.project = this.projects.find(
      (item: any) => item.id === id
    );

    console.log(
      'SELECTED PROJECT:',
      this.project
    );

  });

}

  openProjectDetails(project: any): void {
  this.router.navigate(['/project-details', project.id]);
}

}