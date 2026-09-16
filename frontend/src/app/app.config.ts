import {
  ApplicationConfig,
  provideZoneChangeDetection,
  importProvidersFrom
} from '@angular/core';

import {
  provideRouter,
  withInMemoryScrolling
} from '@angular/router';

import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import {
  FormsModule
} from '@angular/forms';


// =========================================================
// FIREBASE
// =========================================================

import {
  initializeApp,
  provideFirebaseApp
} from '@angular/fire/app';

import {
  getAuth,
  provideAuth
} from '@angular/fire/auth';

import {
  provideFirestore,
  getFirestore
} from '@angular/fire/firestore';


// =========================================================
// INTERCEPTOR
// =========================================================

import {
  authInterceptor
} from './interceptors/auth.interceptor';


// =========================================================
// COMPONENTS
// =========================================================

import {
  HomeComponent
} from './home/home.component';

import {
  PropertyComponent
} from './property/property.component';

import {
  LoginComponent
} from './login/login.component';

import {
  DashboardComponent
} from './dashboard/dashboard.component';

import {
  ContactComponent
} from './contact/contact.component';

import {
  PostPropertyComponent
} from './post-property/post-property.component';

import {
  PropertyDetailsComponent
} from './property-details/property-details.component';

import {
  PropertiesCatalogComponent
} from './properties-catalog/properties-catalog.component';

import {
  AgentsViewComponent
} from './agents-view/agents-view.component';

import {
  AgentDetailComponent
} from './agent-detail/agent-detail.component';

import {
  AddPropertyFormComponent
} from './add-property-form/add-property-form.component';

import {
  PendingApprovalComponent
} from './pending-approval/pending-approval.component';

import {
  FooterComponent
} from './footer/footer.component';

import {
  FullHomeCleaningComponent
} from './full-home-cleaning/full-home-cleaning.component';

import {
  KitchenBatroonCleaningComponent
} from './kitchen-batroon-cleaning/kitchen-batroon-cleaning.component';

import {
  SofaCarpetCleaningComponent
} from './sofa-carpet-cleaning/sofa-carpet-cleaning.component';

import {
  LuxuryPaintingComponent
} from './luxury-painting/luxury-painting.component';

import {
  WeatherproofingComponent
} from './weatherproofing/weatherproofing.component';

import {
  DesignerWalpaperComponent
} from './designer-walpaper/designer-walpaper.component';

import {
  PropertyVerificationComponent
} from './property-verification/property-verification.component';

import {
  RentalAgreementComponent
} from './rental-agreement/rental-agreement.component';

import {
  AdminLoginComponent
} from './admin-login/admin-login.component';

import {
  SobhaProjectsComponent
} from './sobha-projects/sobha-projects.component';

import {
  ProjectDetailsComponent
} from './project-details/project-details.component';

import {
  PortfolioComponent
} from './portfolio/portfolio.component';

import {
  ProjectAdComponent
} from './project-ad/project-ad.component';


// =========================================================
// GUARDS + ENVIRONMENT
// =========================================================

import {
  authGuard
} from './guards/auth.guard';

import {
  adminGuard
} from './guards/admin.guard';

import {
  enviroment
} from '../enviroments/enviroment';


export const appConfig: ApplicationConfig = {

  providers: [

    provideZoneChangeDetection({
      eventCoalescing: true
    }),


    provideHttpClient(
      withInterceptors([
        authInterceptor
      ])
    ),


    importProvidersFrom(
      FormsModule
    ),


    // =====================================================
    // FIREBASE APP
    // =====================================================

    provideFirebaseApp(
      () =>
        initializeApp(
          enviroment.firebaseConfig
        )
    ),


    // =====================================================
    // FIREBASE AUTH
    // =====================================================

    provideAuth(
      () => getAuth()
    ),


    // =====================================================
    // FIRESTORE
    // =====================================================

    provideFirestore(
      () => getFirestore()
    ),


    // =====================================================
    // ROUTES
    // =====================================================

    provideRouter(
      
  [

              // HOME

              {
                  path: '',
            component: HomeComponent
           },


      {
        path: 'home',
        component: HomeComponent
      },


      // PROPERTY

      {
        path: 'property',
        component: PropertyComponent
      },


      {
        path: 'property/edit/:id',
        component: PropertyComponent
      },


      // PROPERTY DETAILS ⭐

      {
        path: 'property-details/:id',
        component: PropertyDetailsComponent
      },


      // PERMALINK DETAILS

      {
        path: 'properties/:permalink',
        component: PropertyDetailsComponent
      },


      // PROPERTY CATALOG

      {
        path: 'properties/sale',
        component: PropertiesCatalogComponent,
        data: {
          mode: 'Sale'
        }
      },


      {
        path: 'properties/rent',
        component: PropertiesCatalogComponent,
        data: {
          mode: 'Rent'
        }
      },


      {
        path: 'properties/commercial',
        component: PropertiesCatalogComponent,
        data: {
          mode: 'Commercial'
        }
      },


      // AUTH

      {
        path: 'login',
        component: LoginComponent
      },


      {
        path: 'dashboard',
        component: DashboardComponent
      },


      {
        path: 'admin-login',
        component: AdminLoginComponent
      },


      // POST PROPERTY

      {
        path: 'post-property',
        component: PostPropertyComponent
      },


      {
        path: 'add-property-form',
        component: AddPropertyFormComponent
      },


{
  path: 'properties-catlog',
  component: PropertiesCatalogComponent,
  data: {
    mode: 'All'
  }
},
      {
        path: 'pending-approval',
        component: PendingApprovalComponent
      },


      // AGENTS

      {
        path: 'agents-view',
        component: AgentsViewComponent
      },


      {
        path: 'agent-detail/:id',
        component: AgentDetailComponent
      },


      // PROJECTS

      {
        path: 'sobha-projects',
        component: SobhaProjectsComponent
      },


      {
        path: 'project-details/:id',
        component: ProjectDetailsComponent
      },


      {
        path: 'project-ad',
        component: ProjectAdComponent
      },


      // OTHER

      {
        path: 'contact',
        component: ContactComponent
      },


      {
        path: 'property-verification',
        component: PropertyVerificationComponent
      },


      {
        path: 'rental-agreement',
        component: RentalAgreementComponent
      },


      // CLEANING

      {
        path: 'full-home-cleaning',
        component: FullHomeCleaningComponent
      },


      {
        path: 'kitchen-bathroom-cleaning',
        component: KitchenBatroonCleaningComponent
      },


      {
        path: 'sofa-carpet-claening',
        component: SofaCarpetCleaningComponent
      },


      {
        path: 'luxury-painting',
        component: LuxuryPaintingComponent
      },


      {
        path: 'weatherproofing',
        component: WeatherproofingComponent
      },


      {
        path: 'designer-walpaper',
        component: DesignerWalpaperComponent
      },


      // PORTFOLIO

      {
        path: 'portfolio',
        component: PortfolioComponent
      },


      // FOOTER

      {
        path: 'footer',
        component: FooterComponent
      },


      // FALLBACK

      {
        path: '**',
        redirectTo: ''
      }
      

    ],
  
  withInMemoryScrolling({
    scrollPositionRestoration: 'top',
    anchorScrolling: 'enabled'
  })


  )]

};