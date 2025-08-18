import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ChatMessage } from './signalr.service';

@Injectable({ providedIn: 'root' })
export class ChatOld {
  private lastMessages: { [patientId: string]: ChatMessage } = {};

  constructor(private http: HttpClient) {}

  async fetchLastMessage(userId: string, patientId: string): Promise<ChatMessage | null> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('otherUserId', patientId);

    const msgs = await this.http.get<ChatMessage[]>(`http://localhost:5073/api/Chat/GetMessages`, { params }).toPromise();
    if (msgs && msgs.length > 0) {
      const lastMsg = msgs.map(m => ({ ...m, sentAt: new Date(m.sentAt) }))
                          .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())[0];
      this.lastMessages[patientId] = lastMsg;
      return lastMsg;
    }
    return null;
  }

  getCachedLastMessage(patientId: string): ChatMessage | null {
    return this.lastMessages[patientId] || null;
  }
}
