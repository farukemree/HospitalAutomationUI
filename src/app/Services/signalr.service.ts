import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ChatMessage {
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  message: string;
  sentAt: Date;
  conversationId: string;
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  hubConnection!: signalR.HubConnection;
  private apiUrl = 'http://localhost:5073/api/Chat';

  constructor(private http: HttpClient) {}

  // -------------------------
  // Bağlantı başlat
  // -------------------------
  startConnection(): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5073/chatHub', { 
        accessTokenFactory: () => localStorage.getItem('token') || '' 
      })
      .withAutomaticReconnect()
      .build();

    return this.hubConnection
      .start()
      .then(() => console.log('✅ SignalR bağlantısı kuruldu'))
      .catch(err => {
        console.error('❌ SignalR bağlantı hatası:', err);
        throw err;
      });
  }

  // -------------------------
  // Sohbete katıl
  // -------------------------
  joinConversation(conversationId: string) {
    if (!this.hubConnection) return;
    return this.hubConnection.invoke("JoinConversation", conversationId.toString())
      .catch(err => console.error("❌ JoinConversation hatası:", err));
  }

  // -------------------------
  // Mesaj dinleyici
  // -------------------------
  addReceiveMessageListener(callback?: (msg: ChatMessage) => void) {
    if (!this.hubConnection) return;

    this.hubConnection.on('ReceiveMessage', (chatMessage: ChatMessage) => {
      chatMessage.sentAt = new Date(chatMessage.sentAt); // string -> Date
      if (callback) callback(chatMessage);
    });
  }

  // -------------------------
  // Mesaj gönder (conversationId ile)
  // -------------------------
  sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    receiverId: string,
    receiverName: string,
    message: string
  ) {
    if (!this.hubConnection) return;
    return this.hubConnection.invoke(
      "SendMessage",
      conversationId,
      senderId.toString(),
      senderName.toString(),
      receiverId.toString(),
      receiverName.toString(),
      message.toString()
    ).catch(err => console.error('❌ SendMessage hatası:', err));
  }

  // -------------------------
  // Geçmiş mesajları getir
  // -------------------------
  getOldMessages(userId: string, otherUserId: string): Observable<ChatMessage[]> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('otherUserId', otherUserId);

    return this.http.get<ChatMessage[]>(`${this.apiUrl}/GetMessages`, { params })
      .pipe(
        catchError(err => {
          console.error('❌ Mesajları çekerken hata oluştu:', err);
          return throwError(() => err);
        })
      );
  }
}
