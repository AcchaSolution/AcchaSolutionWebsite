import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  CommonModule,
  DatePipe,
  TitleCasePipe
} from '@angular/common';

import {
  Router,
  RouterModule
} from '@angular/router';

import {
  firstValueFrom
} from 'rxjs';

import {
  AuthService
} from '../services/auth.service';

import {
  PropertyService
} from '../services/property.service';


// =====================================================
// DASHBOARD COMPONENT
// =====================================================

@Component({

  selector: 'app-dashboard',

  standalone: true,

  imports: [
    CommonModule,
    RouterModule,
    TitleCasePipe,
    DatePipe
  ],

  templateUrl: './dashboard.component.html',

  styleUrls: ['./dashboard.component.css']

})


export class DashboardComponent
  implements OnInit {


  // =====================================================
  // SERVICES
  // =====================================================

  private router = inject(Router);

  private authService = inject(AuthService);

  private propertyService =
    inject(PropertyService);


  // =====================================================
  // ADMIN / UI STATE
  // =====================================================

  adminUser: any = null;

  showAdminMenu: boolean = false;

  viewMode: string = 'dashboard';


  // =====================================================
  // PROPERTY DATA
  // =====================================================

  propertyList: any[] = [];


  // =====================================================
  // AGENT DATA
  // =====================================================

  pendingAgents: any[] = [];

  approvedAgents: any[] = [];

  selectedAgent: any = null;

  agents: any[] = [];


  // =====================================================
  // DASHBOARD STATS
  // =====================================================

  totalProperties: number = 0;

  pendingReview: number = 0;


  // =====================================================
  // COMPONENT INIT
  // =====================================================

  ngOnInit(): void {

    console.log(
      '================================='
    );

    console.log(
      'DASHBOARD COMPONENT LOADED'
    );

    console.log(
      '================================='
    );


    // ===================================================
    // CHECK NODE.JS JWT
    // ===================================================

    const token =
      localStorage.getItem('authToken');


    const adminLoggedIn =
      localStorage.getItem('adminLoggedIn');


    console.log(
      'JWT Token:',
      token ? 'FOUND' : 'NOT FOUND'
    );


    console.log(
      'Admin Logged In:',
      adminLoggedIn
    );


    // ===================================================
    // IF JWT NOT PRESENT
    // ===================================================

    if (!token) {

      console.warn(
        'No authToken found. Redirecting to login.'
      );

      this.router.navigate([
        '/login'
      ]);

      return;
    }


    // ===================================================
    // ADMIN INFORMATION
    // ===================================================

    this.adminUser = {

      email:
        localStorage.getItem('adminEmail') ||
        localStorage.getItem('userEmail') ||
        '',

      displayName:
        localStorage.getItem('userName') ||
        'Admin'

    };


    console.log(
      'Admin User:',
      this.adminUser
    );


    // ===================================================
    // LOAD DASHBOARD
    // ===================================================

    this.loadDashboardData();

  }


  // =====================================================
  // LOAD ALL DASHBOARD DATA
  // =====================================================

  async loadDashboardData(): Promise<void> {

    try {

      await Promise.all([

        this.fetchProperties(),

        this.fetchUsers()

      ]);


      console.log(
        '================================='
      );

      console.log(
        'DASHBOARD DATA LOADED SUCCESSFULLY'
      );

      console.log(
        '================================='
      );


    } catch (error) {

      console.error(
        'Dashboard data loading failed:',
        error
      );

    }

  }


  // =====================================================
  // FETCH PROPERTIES
  // =====================================================
  //
  // PROPERTY SOURCE:
  //
  // Angular
  //    ↓
  // PropertyService
  //    ↓
  // Node.js API
  //    ↓
  // MongoDB
  //
  // NO FIRESTORE
  // =====================================================

  async fetchProperties(): Promise<void> {

    try {

      console.log(
        '================================='
      );

      console.log(
        'FETCHING PROPERTIES FROM MONGODB'
      );

      console.log(
        '================================='
      );


      const response =
        await firstValueFrom(
          this.propertyService.getProperties()
        );


      console.log(
        'RAW PROPERTY RESPONSE:',
        response
      );


      // =================================================
      // NORMALIZE PROPERTY ARRAY
      // =================================================

      const properties =
        Array.isArray(response)
          ? response
          : [];


      // =================================================
      // MAP PROPERTY DATA
      // =================================================

      this.propertyList =
        properties.map(
          (property: any) => {

            const normalizedStatus =
              String(
                property?.status ||
                'pending'
              )
                .trim()
                .toLowerCase();


            return {

              ...property,


              // -----------------------------------------
              // ID
              // -----------------------------------------

              id:
                property?.id ||
                property?._id ||
                property?.uniqueId ||
                '',


              // -----------------------------------------
              // PROPERTY NAME
              // -----------------------------------------

              name:
                property?.name ||
                property?.title ||
                property?.propertyName ||
                'Untitled Property',


              // -----------------------------------------
              // LOCATION
              // -----------------------------------------

              location:
                property?.location ||
                property?.locality ||
                property?.subLocality ||
                property?.address ||
                property?.city ||
                'N/A',


              // -----------------------------------------
              // CITY
              // -----------------------------------------

              city:
                property?.city ||
                '',


              // -----------------------------------------
              // LOCALITY
              // -----------------------------------------

              locality:
                property?.locality ||
                property?.location ||
                '',


              // -----------------------------------------
              // TYPE
              // -----------------------------------------

              type:
                property?.type ||
                property?.propertyType ||
                'N/A',


              // -----------------------------------------
              // BHK
              // -----------------------------------------

              bhk:
                property?.bhk ||
                property?.BHK ||
                property?.bedrooms ||
                'N/A',


              // -----------------------------------------
              // PRICE
              // -----------------------------------------

              price:
                property?.price ||
                0,


              // -----------------------------------------
              // STATUS
              // -----------------------------------------

              status:
                normalizedStatus

            };

          }
        );


      // =================================================
      // TOTAL PROPERTY COUNT
      // =================================================

      this.totalProperties =
        this.propertyList.length;


      // =================================================
      // PENDING PROPERTY COUNT
      // =================================================

      this.pendingReview =
        this.propertyList.filter(
          (property: any) => {

            const status =
              String(
                property?.status ||
                ''
              )
                .trim()
                .toLowerCase();


            return (
              status === 'pending' ||
              status === 'pending review' ||
              status === 'under review'
            );

          }
        ).length;


      // =================================================
      // CONSOLE
      // =================================================

      console.log(
        '================================='
      );

      console.log(
        'PROPERTIES FROM MONGODB:',
        this.propertyList
      );

      console.log(
        'TOTAL PROPERTIES:',
        this.totalProperties
      );

      console.log(
        'PENDING PROPERTIES:',
        this.pendingReview
      );

      console.log(
        '================================='
      );


    } catch (error) {

      console.error(
        '================================='
      );

      console.error(
        'ERROR FETCHING PROPERTIES'
      );

      console.error(
        error
      );

      console.error(
        '================================='
      );


      // Reset values if API fails

      this.propertyList = [];

      this.totalProperties = 0;

      this.pendingReview = 0;

    }

  }


  // =====================================================
  // FETCH USERS
  // =====================================================
  //
  // SOURCE:
  //
  // Node.js + MongoDB
  // =====================================================

  async fetchUsers(): Promise<void> {

    try {

      console.log(
        '================================='
      );

      console.log(
        'FETCHING USERS FROM MONGODB'
      );

      console.log(
        '================================='
      );


      const response =
        await firstValueFrom(
          this.authService.getAllUsers()
        );


      console.log(
        'ALL USERS FROM MONGODB:',
        response
      );


      // =================================================
      // CHECK API RESPONSE
      // =================================================

      if (
        !response ||
        !response.success
      ) {

        console.error(
          'Users API failed:',
          response
        );

        this.agents = [];

        this.pendingAgents = [];

        this.approvedAgents = [];

        return;

      }


      // =================================================
      // SAVE ALL USERS
      // =================================================

      this.agents =
        (response.users || []).map(
          (user: any) => ({

            id:
              user?._id ||
              user?.id ||
              '',

            name:
              user?.name ||
              'Agent',

            email:
              user?.email ||
              '',

            phone:
              user?.phone ||
              '',

            experience:
              user?.experience ||
              0,

            role:
              user?.role ||
              'owner',

            status:
              String(
                user?.status ||
                'pending'
              )
                .trim()
                .toLowerCase(),

            createdAt:
              user?.createdAt,

            updatedAt:
              user?.updatedAt

          })
        );


      // =================================================
      // PENDING USERS
      // =================================================

      this.pendingAgents =
        this.agents.filter(
          (user: any) => {

            return (
              String(
                user?.status ||
                ''
              )
                .trim()
                .toLowerCase() ===
              'pending'
            );

          }
        );


      // =================================================
      // APPROVED USERS
      // =================================================

      this.approvedAgents =
        this.agents.filter(
          (user: any) => {

            return (
              String(
                user?.status ||
                ''
              )
                .trim()
                .toLowerCase() ===
              'approved'
            );

          }
        );


      // =================================================
      // CONSOLE
      // =================================================

      console.log(
        'ALL USERS:',
        this.agents
      );

      console.log(
        'PENDING USERS:',
        this.pendingAgents
      );

      console.log(
        'APPROVED USERS:',
        this.approvedAgents
      );


    } catch (error) {

      console.error(
        'Error fetching users from MongoDB:',
        error
      );


      this.agents = [];

      this.pendingAgents = [];

      this.approvedAgents = [];

    }

  }


  // =====================================================
  // LOGOUT
  // =====================================================

  onLogout(): void {

    const confirmed =
      confirm(
        'Are you sure you want to logout?'
      );


    if (!confirmed) {

      return;

    }


    // =================================================
    // NODE JWT
    // =================================================

    localStorage.removeItem(
      'authToken'
    );


    // =================================================
    // OLD TOKEN
    // =================================================

    localStorage.removeItem(
      'token'
    );


    // =================================================
    // ADMIN STATE
    // =================================================

    localStorage.removeItem(
      'adminLoggedIn'
    );

    localStorage.removeItem(
      'adminEmail'
    );

    localStorage.removeItem(
      'userEmail'
    );

    localStorage.removeItem(
      'userName'
    );


    // =================================================
    // LOGIN
    // =================================================

    this.router.navigate([
      '/login'
    ]);

  }


  // =====================================================
  // OPEN AGENT PROFILE
  // =====================================================

  openAgentProfile(
    agent: any
  ): void {

    this.selectedAgent = {

      ...agent,

      status:
        String(
          agent?.status ||
          'pending'
        )
          .trim()
          .toLowerCase()

    };


    console.log(
      'Selected Agent:',
      this.selectedAgent
    );


    console.log(
      'Selected Agent Status:',
      this.selectedAgent.status
    );


    this.viewMode =
      'agent-detail';

  }


  // =====================================================
  // APPROVE AGENT
  // =====================================================

  grantAgentApproval(
    agentId: string
  ): void {

    console.log(
      'APPROVAL BUTTON CLICKED'
    );


    console.log(
      'Agent ID:',
      agentId
    );


    this.authService
      .approveAgent(agentId)
      .subscribe({

        // =============================================
        // SUCCESS
        // =============================================

        next: (res: any) => {

          console.log(
            'APPROVAL API RESPONSE:',
            res
          );


          if (
            res?.success
          ) {

            alert(
              'Agent approved successfully!'
            );


            // -----------------------------------------
            // UPDATE SELECTED AGENT
            // -----------------------------------------

            if (
              this.selectedAgent
            ) {

              this.selectedAgent.status =
                'approved';

            }


            // -----------------------------------------
            // REFRESH USERS
            // -----------------------------------------

            this.fetchUsers();


            // -----------------------------------------
            // AGENT LIST
            // -----------------------------------------

            this.viewMode =
              'agents';


            // -----------------------------------------
            // CLEAR SELECTED AGENT
            // -----------------------------------------

            this.selectedAgent =
              null;

          }

          else {

            alert(
              res?.message ||
              'Agent approval failed.'
            );

          }

        },


        // =============================================
        // ERROR
        // =============================================

        error: (error: any) => {

          console.error(
            'APPROVAL API ERROR:',
            error
          );


          alert(
            error?.error?.message ||
            'Failed to approve agent.'
          );

        }

      });

  }


  // =====================================================
  // REVOKE AGENT APPROVAL
  // =====================================================

  revokeAgentApproval(
    agentId: string
  ): void {

    console.log(
      'REVOKE APPROVAL REQUESTED:',
      agentId
    );


    this.authService
      .revokeAgent(agentId)
      .subscribe({

        // =============================================
        // SUCCESS
        // =============================================

        next: (res: any) => {

          console.log(
            '========== REVOKE API RESPONSE =========='
          );


          console.log(
            res
          );


          console.log(
            'Success:',
            res?.success
          );


          console.log(
            'Message:',
            res?.message
          );


          console.log(
            '========================================='
          );


          if (
            res?.success === true
          ) {

            alert(
              'Agent approval revoked successfully!'
            );


            // -----------------------------------------
            // REFRESH USERS
            // -----------------------------------------

            this.fetchUsers();


            // -----------------------------------------
            // AGENT LIST
            // -----------------------------------------

            this.viewMode =
              'agents';


            // -----------------------------------------
            // CLEAR SELECTED AGENT
            // -----------------------------------------

            this.selectedAgent =
              null;

          }

          else {

            alert(
              res?.message ||
              'Failed to revoke agent approval.'
            );

          }

        },


        // =============================================
        // ERROR
        // =============================================

        error: (error: any) => {

          console.error(
            '========== REVOKE API ERROR =========='
          );


          console.error(
            error
          );


          console.error(
            'STATUS:',
            error?.status
          );


          console.error(
            'ERROR BODY:',
            error?.error
          );


          console.error(
            '======================================'
          );


          alert(
            error?.error?.message ||
            'Failed to revoke agent approval.'
          );

        }

      });

  }


  // =====================================================
  // DELETE AGENT
  // =====================================================

  deleteAgent(
    agentId: string
  ): void {

    console.log(
      'DELETE AGENT REQUESTED:',
      agentId
    );


    const confirmed =
      confirm(
        'Are you sure you want to permanently delete this agent?'
      );


    if (!confirmed) {

      return;

    }


    this.authService
      .deleteAgent(agentId)
      .subscribe({

        // =============================================
        // SUCCESS
        // =============================================

        next: (res: any) => {

          console.log(
            '========== DELETE API RESPONSE =========='
          );


          console.log(
            res
          );


          if (
            res?.success === true
          ) {

            alert(
              'Agent deleted successfully!'
            );


            // -----------------------------------------
            // REFRESH USERS
            // -----------------------------------------

            this.fetchUsers();


            // -----------------------------------------
            // AGENT LIST
            // -----------------------------------------

            this.viewMode =
              'agents';


            // -----------------------------------------
            // CLEAR SELECTED AGENT
            // -----------------------------------------

            this.selectedAgent =
              null;

          }

          else {

            alert(
              res?.message ||
              'Failed to delete agent.'
            );

          }

        },


        // =============================================
        // ERROR
        // =============================================

        error: (error: any) => {

          console.error(
            '========== DELETE API ERROR =========='
          );


          console.error(
            error
          );


          console.error(
            'STATUS:',
            error?.status
          );


          console.error(
            'ERROR BODY:',
            error?.error
          );


          alert(
            error?.error?.message ||
            'Failed to delete agent.'
          );

        }

      });

  }


  // =====================================================
  // CHECK AGENT PENDING
  // =====================================================

  isAgentPending(
    agentId: string
  ): boolean {

    return this.pendingAgents.some(
      agent =>
        agent.id === agentId
    );

  }


  // =====================================================
  // AGENT INITIALS
  // =====================================================

  getAgentInitials(
    name: any
  ): string {

    if (
      !name ||
      typeof name !== 'string'
    ) {

      return 'AG';

    }


    const cleanName =
      name.trim();


    if (!cleanName) {

      return 'AG';

    }


    // First two characters
    return cleanName
      .slice(0, 2)
      .toUpperCase();

  }


  // =====================================================
  // CREATE PROPERTY
  // =====================================================

  goToCreateProperty(): void {

    console.log(
      'CREATE PROPERTY BUTTON CLICKED'
    );


    this.router.navigate([
      '/property'
    ]);

  }


  // =====================================================
// EDIT PROPERTY
// =====================================================

viewProperty(property: any): void {

  const id =
    property?.id ||
    property?._id ||
    property?.uniqueId ||
    '';

  if (!id) {
    alert('Property ID not found.');
    return;
  }

  console.log('EDIT PROPERTY ID:', id);

  this.router.navigate(
    ['/property'],
    {
      queryParams: {
        id: String(id)
      }
    }
  );
}


// =====================================================
// DELETE PROPERTY
// =====================================================

deleteProperty(property: any): void {

  const id =
    property?.id ||
    property?._id ||
    property?.uniqueId ||
    '';

  if (!id) {
    alert('Property ID not found.');
    return;
  }

  const confirmed = confirm(
    'Are you sure you want to permanently delete this property?'
  );

  if (!confirmed) {
    return;
  }

  console.log('DELETE PROPERTY ID:', id);

  this.propertyService
    .deleteProperty(String(id))
    .subscribe({

      next: (res: any) => {

        console.log(
          'PROPERTY DELETE RESPONSE:',
          res
        );

        alert('Property deleted successfully!');

        // Dashboard table refresh
        this.fetchProperties();
      },

      error: (error: any) => {

        console.error(
          'PROPERTY DELETE ERROR:',
          error
        );

        alert(
          error?.error?.message ||
          'Property delete nahi ho payi.'
        );
      }

    });
}

  // =====================================================
  // ADMIN NAME
  // =====================================================

  getAdminName(): string {

    if (!this.adminUser) {

      return 'Admin';

    }


    return (

      this.adminUser.displayName ||

      localStorage.getItem(
        'userName'
      ) ||

      'Admin'

    );

  }


  // =====================================================
  // ADMIN EMAIL
  // =====================================================

  getAdminEmail(): string {

    return (

      this.adminUser?.email ||

      localStorage.getItem(
        'adminEmail'
      ) ||

      localStorage.getItem(
        'userEmail'
      ) ||

      ''

    );

  }


  // =====================================================
  // ADMIN INITIAL
  // =====================================================

  getAdminInitial(): string {

    const name =
      this.getAdminName();


    if (!name) {

      return 'A';

    }


    return name
      .trim()
      .charAt(0)
      .toUpperCase();

  }


  // =====================================================
  // ADMIN MENU
  // =====================================================

  toggleAdminMenu(): void {

    this.showAdminMenu =
      !this.showAdminMenu;

  }

}