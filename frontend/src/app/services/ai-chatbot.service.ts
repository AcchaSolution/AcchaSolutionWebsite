import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiChatbotService {
  // Aapka backend local server URL
  private apiUrl = 'http://localhost:5000/api/ai/chat-assistant';

  constructor(private http: HttpClient) {}

  /**
   * User ka message backend script ko pass karne ke liye
   */
  sendMessageToAI(userMessage: string, chatHistory: any[]): Observable<any> {
    return this.http.post<any>(this.apiUrl, { message: userMessage, history: chatHistory });
  }
}
