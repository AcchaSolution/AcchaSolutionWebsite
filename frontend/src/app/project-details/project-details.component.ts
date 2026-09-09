import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

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
    private route: ActivatedRoute
  ) {}


  // =====================================================
  // LOAD PROJECT
  // =====================================================

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const projectId = params.get('id');

      console.log('URL PROJECT ID:', projectId);


      if (projectId) {

        this.project = this.projects.find(
          (item: any) =>
            item.id === projectId
        );

      }


      console.log(
        'SELECTED PROJECT:',
        this.project
      );


      // =================================================
      // TEST FALLBACK
      // =================================================

      if (!this.project) {

        this.project = this.projects[0];

        console.log(
          'Fallback project loaded:',
          this.project
        );

      }

    });

  }

}