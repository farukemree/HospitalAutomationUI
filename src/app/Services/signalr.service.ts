import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;

startConnection(): Promise<void> {
  this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl('http://localhost:5073/notificationHub', { withCredentials: true })
    .build();

  return this.hubConnection
    .start()
    .then(() => console.log('✅ SignalR bağlantısı kuruldu'))
    .catch(err => {
      console.error('❌ SignalR bağlantı hatası:', err);
      throw err;
    });
}


  // Mesaj dinleyici
  addReceiveMessageListener() {
    this.hubConnection.on('ReceiveMessage', (user: string, message: string) => {
      console.log(`📩 Mesaj Geldi → ${user}: ${message}`);
      alert(`${user}: ${message}`); // Anlık popup
    });
  }

  // Doktor gruba katılır
  joinDoctorGroup(doctorId: string) {
    this.hubConnection.invoke("JoinDoctorGroup", doctorId)
      .catch(err => console.error('❌ JoinDoctorGroup hatası:', err));
  }
}
