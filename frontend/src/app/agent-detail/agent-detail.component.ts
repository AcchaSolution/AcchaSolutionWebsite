import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Firestore, deleteDoc, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-agent-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agent-detail.component.html',
  styleUrl: './agent-detail.component.css'
})
export class AgentDetailComponent implements OnInit {

  agent: any = null;

  private firestore = inject(Firestore);

  constructor(
    private route: ActivatedRoute,
    private location: Location
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      try {
        const docRef = doc(this.firestore, 'users', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          this.agent = {
            ...data,
            id: docSnap.id,
            verified: data['status'] === 'approved'
          };

          console.log(
            'Agent data loaded with ID:',
            this.agent.id
          );
        }

      } catch (error) {
        console.error(
          'Error fetching agent:',
          error
        );
      }
    }
  }

  async deleteUser(documentId: string) {

    if (!documentId) {
      alert('Error: Agent ID nahi mili!');
      return;
    }

    if (
      confirm(
        'Kya aap sach mein is agent record ko delete karna chahti hain? Ye action wapas undo nahi hoga.'
      )
    ) {

      try {

        await deleteDoc(
          doc(this.firestore, 'users', documentId)
        );

        alert('Agent record delete ho gaya!');

        this.goBack();

      } catch (error) {

        console.error(
          'Error deleting document: ',
          error
        );

        alert('Delete karne mein error aaya!');
      }
    }
  }

  goBack() {
    this.location.back();
  }
}