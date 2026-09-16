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

  // ============================================================
  // SEARCH / PROPERTY DATA
  // ============================================================

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

  showAllProperties: boolean = false;
  hasSearched: boolean = false;

  isAiSearching: boolean = false;


  // ============================================================
  // BUILDER SECTION
  // ============================================================

  selectedProjectLocation: string = 'All';
  selectedBuilder: any = null;

  /*
    false = Builder section hidden
    true  = Builder section visible

    IMPORTANT:
    Aapne builder/project section ko abhi incomplete hone ke
    reason se hide karna bola tha.
    Isliye live launch ke liye ise false rakhna better hai.
  */

  showBuilderProjectsSection: boolean = false;


  // ============================================================
  // BUILDER PROJECT DATA
  // ============================================================

  builderProjects: any[] = [

    {
      name: 'SOBHA',
      logoUrl: '/images/builder/sobha.png',
      location: 'Whitefield',
      project: 'Upcoming Sobha Project',
      count: 'Upcoming Projects',

      projects: [

        {
          id: 'sobha-oneworld',
          name: 'SOBHA OneWorld',
          location: 'Whitefield',
          image: 'assets/default-project.jpg'
        },

        {
          id: 'sobha-windsor',
          name: 'SOBHA Windsor',
          location: 'Hoodi',
          image: 'assets/default-project.jpg'
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
          id: 'prestige-project-1',
          name: 'Prestige Project 1',
          location: 'Whitefield',
          image: 'assets/default-project.jpg'
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
          id: 'brigade-project-1',
          name: 'Brigade Project 1',
          location: 'Hoodi',
          image: 'assets/default-project.jpg'
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
          id: 'godrej-project-1',
          name: 'Godrej Project 1',
          location: 'Whitefield',
          image: 'assets/default-project.jpg'
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
          id: 'puravankara-project-1',
          name: 'Puravankara Project 1',
          location: 'Hoodi',
          image: 'assets/default-project.jpg'
        }

      ]
    }

  ];


  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(
    private propService: PropertyService,
    private router: Router,
    private http: HttpClient
  ) {}


  // ============================================================
  // INIT
  // ============================================================

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


  // ============================================================
  // TAB
  // ============================================================

  selectTab(tab: string): void {

    this.activeTab = tab;

    console.log(
      '🔄 ACTIVE TAB:',
      this.activeTab
    );

  }


  // ============================================================
  // TRACK PROJECT
  // ============================================================

  trackProjectById(
    index: number,
    project: any
  ): string | number {

    return project?.id || index;

  }


  // ============================================================
  // MAIN HOME SEARCH
  // ============================================================


searchProperties(): void {

  console.log('========== HOME SEARCH ==========');
  console.log('Selected BHK:', this.selectedBhk);
  console.log('Keyword:', this.searchKeyword);
  console.log('City:', this.selectedCity);
  console.log('Total properties:', this.allProperties.length);

  const normalize = (value: any): string => {
    return String(value ?? '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  };

  const selectedBhk = normalize(this.selectedBhk);
  const selectedCity = normalize(this.selectedCity);
  const keyword = normalize(this.searchKeyword);

  let result = [...this.allProperties];

  /* =====================================================
     BHK
     ===================================================== */

  if (selectedBhk) {

    result = result.filter((property: any) => {

      const propertyBhk = normalize(
        property.bhk ??
        property.bhkType ??
        property.bedrooms ??
        property.bedroom ??
        ''
      );

      console.log(
        'BHK CHECK:',
        property.name,
        propertyBhk,
        'vs',
        selectedBhk
      );

      return propertyBhk === selectedBhk;
    });
  }


  /* =====================================================
     LOCATION
     ===================================================== */

  if (selectedCity) {

    result = result.filter((property: any) => {

      const locationText = normalize([
        property.location,
        property.city,
        property.locality,
        property.subLocality,
        property.address,
        property.landmark
      ].join(' '));

      return locationText.includes(selectedCity);
    });
  }


  /* =====================================================
     KEYWORD / NATURAL SEARCH
     ===================================================== */

  if (keyword) {

    // BHK already handled separately
    const bhkMatch = keyword.match(/\b([1-5])\s*bhk\b/i);

    let searchText = keyword;

    if (bhkMatch) {
      searchText = searchText.replace(
        /\b([1-5])\s*bhk\b/gi,
        ''
      );
    }

    // Remove common words
    searchText = searchText
      .replace(/\bproperty\b/gi, '')
      .replace(/\bproperties\b/gi, '')
      .replace(/\bin\b/gi, '')
      .replace(/\bat\b/gi, '')
      .replace(/\bnear\b/gi, '')
      .replace(/\bflat\b/gi, '')
      .replace(/\bapartment\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();


    // If BHK was typed in search box
    if (bhkMatch) {

      const requestedBhk =
        `${bhkMatch[1]} bhk`;

      result = result.filter((property: any) => {

        const propertyBhk = normalize(
          property.bhk ??
          property.bhkType ??
          property.bedrooms ??
          property.bedroom ??
          ''
        );

        return propertyBhk === requestedBhk;
      });
    }


    // Remaining location/name text
    if (searchText) {

      result = result.filter((property: any) => {

        const searchable = normalize([
          property.name,
          property.title,
          property.location,
          property.city,
          property.locality,
          property.subLocality,
          property.address,
          property.landmark,
          property.description,
          property.uniqueId
        ].join(' '));

        return searchable.includes(searchText);
      });
    }
  }


  /* =====================================================
     FINAL RESULT
     ===================================================== */

  this.filteredProperties = [...result];
  this.properties = [...result];

  this.hasSearched = true;
  this.showAllProperties = false;

  console.log('========== SEARCH RESULT ==========');
  console.log('FOUND:', result.length);
  console.log(result);


  /* =====================================================
     SCROLL
     ===================================================== */

  setTimeout(() => {

    const section = document.querySelector(
      '.curated-properties-section'
    );

    if (section) {

      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }

  }, 200);
}

  // ============================================================
  // AI SEARCH
  // ============================================================

  private runAiSearch(
    query: string
  ): void {

    this.isAiSearching = true;


    const aiApiUrl =
'https://api.acchasolution.com/api/ai/smart-search';

    const payload = {

      query: query,

      tabContext:
        this.activeTab,

      cityContext:
        this.selectedCity,

      propertyType:
        this.propertyType,

      bhk:
        this.selectedBhk,

      status:
        this.selectedStatus,

      newBuilderProject:
        this.newBuilderProjects

    };


    console.log(
      '🤖 AI SEARCH REQUEST:',
      payload
    );


    this.http
      .post<any>(
        aiApiUrl,
        payload
      )
      .subscribe({

        next: (response: any) => {

          this.isAiSearching =
            false;


          console.log(
            '🤖 AI SEARCH RESPONSE:',
            response
          );


          if (

            response &&
            response.success &&
            Array.isArray(
              response.data
            )

          ) {

            this.router.navigate(

              ['/properties/catalog'],

              {

                state: {

                  aiFilters:
                    response.filtersApplied ||
                    {},

                  directResults:
                    response.data ||
                    []

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
              response.filtersApplied ||
              {};


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


          this.isAiSearching =
            false;


          this.executeTraditionalSearch();

        }

      });

  }


  // ============================================================
  // AI FILTER → QUERY PARAMS
  // ============================================================

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

        (
          filters.newProject ||
          filters.newBuilderProject ||
          this.newBuilderProjects
        )

          ? 'true'
          : undefined

    };

  }


  // ============================================================
  // OLD NORMAL SEARCH
  // ============================================================

  executeTraditionalSearch(): void {

    let targetRoute =
      '/properties/sale';


    if (
      this.activeTab === 'Rent'
    ) {

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


  // ============================================================
  // RESET SEARCH
  // ============================================================

  resetSearch(): void {

    this.hasSearched =
      false;


    this.selectedCity =
      '';

    this.searchKeyword =
      '';

    this.propertyType =
      'Full House';

    this.selectedBhk =
      '';

    this.selectedStatus =
      '';

    this.newBuilderProjects =
      false;

    this.activeTab =
      'Buy';


    this.properties =
      [...this.allProperties];


    this.filteredProperties =
      [...this.allProperties];


    this.showAllProperties =
      false;


    console.log(
      '🔄 HOME SEARCH RESET'
    );

  }


  // ============================================================
  // BUILDER LOCATION FILTER
  // ============================================================

  filterBuilderProjects(
    location: string
  ): void {

    this.selectedProjectLocation =
      location;

  }


  getFilteredBuilderProjects(): any[] {

    if (
      this.selectedProjectLocation ===
      'All'
    ) {

      return this.builderProjects;

    }


    if (
      this.selectedProjectLocation ===
      'Bangalore'
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


  // ============================================================
  // BUILDER CLICK
  // ============================================================

  openBuilderProjects(
    builder: any
  ): void {

    if (!builder) {

      console.error(
        '❌ Builder missing'
      );

      return;

    }


    const project =
      builder.projects?.[0];


    if (!project) {

      console.error(
        '❌ No project found for builder:',
        builder
      );

      return;

    }


    if (!project.id) {

      console.error(
        '❌ Project ID missing:',
        project
      );


      alert(
        'Project ID missing. Please add project ID first.'
      );

      return;

    }


    console.log(
      '➡️ Opening Project Details:',
      project.id
    );


    this.router.navigate([
      '/project-details',
      project.id
    ]);

  }


  // ============================================================
  // PROJECT CLICK → PROJECT DETAILS
  // ============================================================

  openProjectDetails(
    project: any
  ): void {

    console.log(
      '🟢 PROJECT CLICK:',
      project
    );


    if (!project) {

      console.error(
        '❌ Project missing'
      );

      return;

    }


    if (!project.id) {

      console.error(
        '❌ Project ID missing:',
        project
      );


      alert(
        'Project ID not available.'
      );

      return;

    }


    console.log(
      '➡️ Going to project details:',
      project.id
    );


    this.router.navigate([
      '/project-details',
      project.id
    ]).then(

      success => {

        console.log(
          '🚀 Navigation success:',
          success
        );

      },

      error => {

        console.error(
          '❌ Navigation failed:',
          error
        );

      }

    );

  }


  // ============================================================
  // VIEW ALL PROJECTS
  // ============================================================

  viewAllProjects(): void {

    this.selectedProjectLocation =
      'All';

    this.selectedBuilder =
      null;

  }


  // ============================================================
  // PROPERTY DETAILS
  // ============================================================
viewDetails(uniqueId: string): void {
  if (!uniqueId) {
    console.warn('Property ID not found');
    return;
  }

  this.router.navigate([
    '/property-details',
    uniqueId
  ]);
}


  // viewDetails(
  //   property: any
  // ): void {

  //   if (!property) {

  //     console.error(
  //       '❌ Property object missing'
  //     );

  //     return;

  //   }


  //   const uniqueId =

  //     property.uniqueId ||
  //     property.id ||
  //     property._id;


  //   if (!uniqueId) {

  //     console.error(
  //       '❌ Property ID not found:',
  //       property
  //     );


  //     alert(
  //       'Property ID not available.'
  //     );

  //     return;

  //   }


  //   console.log(
  //     '➡️ Opening property details:',
  //     uniqueId
  //   );


  //   this.router.navigate(
  //     [
  //       '/property-details',
  //       uniqueId
  //     ]
  //   );

  // }


  // ============================================================
  // DISPLAYED PROPERTIES
  // ============================================================

  get displayedProperties(): any[] {

    if (
      this.showAllProperties
    ) {

      return this.properties;

    }


    return this.properties.slice(
      0,
      4
    );

  }


  // ============================================================
  // TOGGLE ALL PROPERTIES
  // ============================================================

toggleAllProperties(): void {

  console.log(
    '➡️ OPENING ALL PROPERTIES PAGE'
  );

  this.router.navigate([
    '/properties-catlog'
  ]);

}

  // ============================================================
  // INITIAL LETTER
  // ============================================================

  getInitialLetter(
    name: any
  ): string {

    if (!name) {

      return '';

    }


    const cleanName =
      String(name).trim();


    return cleanName
      ? cleanName
          .charAt(0)
          .toUpperCase()
      : '';

  }

formatPrice(value: any): string {
  const price = Number(value);

  if (!Number.isFinite(price) || price <= 0) {
    return '₹ 0';
  }

  // Crore
  if (price >= 10000000) {
    const crore = price / 10000000;
    return `₹ ${Number(crore.toFixed(2))} Crore`;
  }

  // Lakh
  if (price >= 100000) {
    const lakh = price / 100000;
    return `₹ ${Number(lakh.toFixed(2))} Lakh`;
  }

  // Thousand
  if (price >= 1000) {
    const thousand = price / 1000;
    return `₹ ${Number(thousand.toFixed(2))} Thousand`;
  }

  // Below 1000
  return `₹ ${price.toLocaleString('en-IN')}`;
}


}



