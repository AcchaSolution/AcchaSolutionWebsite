import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../services/property.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  activeTab: string = 'Buy';

  properties: any[] = [];
  allProperties: any[] = [];
  filteredProperties: any[] = [];
  propertyList: any[] = [];

  selectedCity: string = '';
  searchKeyword: string = '';
  propertyType: string = 'Full House';
  selectedBhk: string = '';
  selectedStatus: string = '';
  newBuilderProjects: boolean = false;

  selectedProjectLocation: string = 'All';
  selectedBuilder: any = null;

  isAiSearching: boolean = false;

  showAllProperties: boolean = false;


  // =====================================================
  // BUILDER PROJECT DATA
  // =====================================================

  builderProjects: any[] = [

    {
      name: 'SOBHA',
      logoUrl: '/images/builder/sobha.png',
      location: 'Whitefield',
      project: 'Upcoming Sobha Project',
      count: 'Upcoming Projects',

      projects: [
        {
          name: 'Sobha Project 1',
          location: 'Whitefield',
          image: 'assets/default-project.jpg',
          link: 'https://www.sobha.com/'
        },
        {
          name: 'Sobha Project 2',
          location: 'Hoodi',
          image: 'assets/default-project.jpg',
          link: 'https://www.sobha.com/'
        }
      ]
    },

    {
      name: 'PRESTIGE',
      logoUrl: '/images/builder/prestige.svg',
      location: 'Whitefield',
      project: 'Upcoming Prestige Project',
      count: 'Upcoming Projects',

      projects: [
        {
          name: 'Prestige Project 1',
          location: 'Whitefield',
          image: 'assets/default-project.jpg',
          link: 'https://www.prestigeconstructions.com/'
        }
      ]
    },

    {
      name: 'BRIGADE',
      logoUrl: '/images/builder/brigade.png',
      location: 'Hoodi',
      project: 'Upcoming Brigade Project',
      count: 'Upcoming Projects',

      projects: [
        {
          name: 'Brigade Project 1',
          location: 'Hoodi',
          image: 'assets/default-project.jpg',
          link: 'https://www.brigadegroup.com/'
        }
      ]
    },

    {
      name: 'GODREJ',
      logoUrl: '/images/builder/godrej.svg',
      location: 'Whitefield',
      project: 'Upcoming Godrej Project',
      count: 'Upcoming Projects',

      projects: [
        {
          name: 'Godrej Project 1',
          location: 'Whitefield',
          image: 'assets/default-project.jpg',
          link: 'https://www.godrejproperties.com/'
        }
      ]
    },

    {
      name: 'PURAVANKARA',
      logoUrl: '/images/builder/purvankara.svg',
      location: 'Hoodi',
      project: 'Upcoming Puravankara Project',
      count: 'Upcoming Projects',

      projects: [
        {
          name: 'Puravankara Project 1',
          location: 'Hoodi',
          image: 'assets/default-project.jpg',
          link: 'https://www.puravankara.com/'
        }
      ]
    }

  ];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private propService: PropertyService,
    private router: Router,
    private http: HttpClient
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.propService.getProperties().subscribe({

      next: (data: any[]) => {

        console.log('🏠 ALL PROPERTIES:', data);

        this.allProperties =
          Array.isArray(data)
            ? data
            : [];

        this.properties =
          [...this.allProperties];

        this.filteredProperties =
          [...this.allProperties];

      },

      error: (err) => {

        console.error(
          '❌ Data load nahi hua:',
          err
        );

        this.allProperties = [];
        this.properties = [];
        this.filteredProperties = [];

      }

    });

  }


  // =====================================================
  // TAB
  // =====================================================

  selectTab(tab: string): void {

    this.activeTab = tab;

  }


  // =====================================================
  // SEARCH
  // =====================================================

  searchProperties(): void {

    const query =
      this.searchKeyword.trim();

    if (!query) {

      alert(
        'Please enter a location or query to search.'
      );

      return;

    }

    const wordCount =
      query
        .split(/\s+/)
        .filter(word => word.length > 0)
        .length;

    if (wordCount > 2) {

      this.runAiSearch(query);

      return;

    }

    this.executeTraditionalSearch();

  }


  // =====================================================
  // AI SEARCH
  // =====================================================

  private runAiSearch(query: string): void {

    this.isAiSearching = true;

    const aiApiUrl =
      'http://localhost:5000/api/ai/smart-search';

    const payload = {

      query: query,

      tabContext: this.activeTab,

      cityContext: this.selectedCity,

      propertyType: this.propertyType,

      bhk: this.selectedBhk,

      status: this.selectedStatus,

      newBuilderProject:
        this.newBuilderProjects

    };

    console.log(
      '🤖 AI SEARCH REQUEST:',
      payload
    );

    this.http.post<any>(
      aiApiUrl,
      payload
    ).subscribe({

      next: (response: any) => {

        this.isAiSearching = false;

        console.log(
          '🤖 AI SEARCH RESPONSE:',
          response
        );

        if (
          response &&
          response.success &&
          Array.isArray(response.data)
        ) {

          this.router.navigate(
            ['/properties/catalog'],
            {
              state: {
                aiFilters:
                  response.filtersApplied || {},

                directResults:
                  response.data || []
              }
            }
          );

          return;

        }

        if (
          response &&
          response.success
        ) {

          const filters =
            response.filtersApplied || {};

          this.router.navigate(
            ['/properties/sale'],
            {
              queryParams:
                this.convertAiFiltersToQueryParams(
                  filters
                )
            }
          );

          return;

        }

        this.executeTraditionalSearch();

      },

      error: (err: any) => {

        console.error(
          '❌ AI API Error:',
          err
        );

        this.isAiSearching = false;

        this.executeTraditionalSearch();

      }

    });

  }


  // =====================================================
  // AI FILTERS
  // =====================================================

  private convertAiFiltersToQueryParams(
    filters: any
  ): any {

    if (!filters) {

      return {
        keyword:
          this.searchKeyword.trim()
      };

    }

    return {

      city:
        filters.city ||
        filters.location ||
        this.selectedCity ||
        undefined,

      keyword:
        filters.keyword ||
        filters.searchKeyword ||
        this.searchKeyword.trim() ||
        undefined,

      type:
        filters.type ||
        filters.propertyType ||
        this.propertyType ||
        undefined,

      bhk:
        filters.bhk ||
        filters.bhkType ||
        this.selectedBhk ||
        undefined,

      status:
        filters.status ||
        filters.propertyStatus ||
        this.selectedStatus ||
        undefined,

      newProject:
        filters.newProject ||
        filters.newBuilderProject ||
        this.newBuilderProjects
          ? 'true'
          : undefined

    };

  }


  // =====================================================
  // NORMAL SEARCH
  // =====================================================

  executeTraditionalSearch(): void {

    let targetRoute =
      '/properties/sale';

    if (this.activeTab === 'Rent') {

      targetRoute =
        '/properties/rent';

    }

    else if (
      this.activeTab === 'Commercial'
    ) {

      targetRoute =
        '/properties/commercial';

    }

    const queryParams: any = {

      city:
        this.selectedCity.trim() ||
        undefined,

      keyword:
        this.searchKeyword.trim() ||
        undefined,

      type:
        this.propertyType.trim() ||
        undefined,

      bhk:
        this.selectedBhk.trim() ||
        undefined,

      status:
        this.selectedStatus.trim() ||
        undefined,

      newProject:
        this.newBuilderProjects
          ? 'true'
          : undefined

    };

    console.log(
      '🚀 NORMAL SEARCH:',
      targetRoute,
      queryParams
    );

    this.router.navigate(
      [targetRoute],
      {
        queryParams
      }
    );

  }


  // =====================================================
  // RESET
  // =====================================================

  resetSearch(): void {

    this.selectedCity = '';
    this.searchKeyword = '';
    this.propertyType = 'Full House';
    this.selectedBhk = '';
    this.selectedStatus = '';
    this.newBuilderProjects = false;
    this.activeTab = 'Buy';

    this.properties =
      [...this.allProperties];

    this.filteredProperties =
      [...this.allProperties];

  }


  // =====================================================
  // BUILDER FILTER
  // =====================================================

  filterBuilderProjects(
    location: string
  ): void {

    this.selectedProjectLocation =
      location;

  }


  // =====================================================
  // FILTERED BUILDERS
  // =====================================================

  getFilteredBuilderProjects(): any[] {

    if (
      this.selectedProjectLocation === 'All'
    ) {

      return this.builderProjects;

    }

    return this.builderProjects.filter(
      (builder: any) => {

        return String(
          builder.location || ''
        )
          .toLowerCase()
          .includes(
            this.selectedProjectLocation
              .toLowerCase()
          );

      }
    );

  }


  // =====================================================
  // OPEN BUILDER
  // =====================================================

  openBuilderProjects(
    builder: any
  ): void {

    if (!builder) {
      return;
    }

    this.selectedBuilder =
      builder;

    setTimeout(() => {

      const section =
        document.querySelector(
          '.builder-project-details'
        ) as HTMLElement | null;

      if (section) {

        section.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

      }

    }, 100);

  }


  // =====================================================
  // OPEN PROJECT DETAILS
  // =====================================================

  openProjectDetails(
    project: any
  ): void {

    if (!project) {
      return;
    }

    if (project.id) {

      this.router.navigate(
        [
          '/project-details',
          project.id
        ]
      );

      return;

    }

    if (project.link) {

      window.open(
        project.link,
        '_blank',
        'noopener,noreferrer'
      );

    }

  }


  // =====================================================
  // VIEW ALL PROJECTS
  // =====================================================

  viewAllProjects(): void {

    this.selectedProjectLocation = 'All';
    this.selectedBuilder = null;

    setTimeout(() => {

      const section =
        document.querySelector(
          '.upcoming-projects-section'
        ) as HTMLElement | null;

      if (section) {

        section.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

      }

    }, 100);

  }


  // =====================================================
  // ⭐ PROPERTY DETAILS — FIXED
  // =====================================================

  viewDetails(
    property: any
  ): void {

    if (!property) {

      console.error(
        '❌ Property object missing'
      );

      return;

    }

    const uniqueId =
      property.uniqueId ||
      property.id ||
      property._id;

    if (!uniqueId) {

      console.error(
        '❌ Property ID not found:',
        property
      );

      alert(
        'Property ID not available.'
      );

      return;

    }

    console.log(
      '➡️ Opening property details:',
      uniqueId
    );

    this.router.navigate(
      [
        '/property-details',
        uniqueId
      ]
    );

  }


  // =====================================================
  // SHOW / HIDE PROPERTIES
  // =====================================================

  get displayedProperties(): any[] {

    if (this.showAllProperties) {

      return this.properties;

    }

    return this.properties.slice(
      0,
      4
    );

  }


  toggleAllProperties(): void {

    this.showAllProperties =
      !this.showAllProperties;

  }


  // =====================================================
  // INITIAL LETTER
  // =====================================================

  getInitialLetter(
    name: any
  ): string {

    if (!name) {
      return '';
    }

    const cleanName =
      String(name).trim();

    return cleanName
      ? cleanName.charAt(0).toUpperCase()
      : '';

  }

}