import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { SignalRService, ChatMessage } from '../../Services/signalr.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';

interface Doctor {
  id: string;
  fullName: string;
  specialization?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
}

@Component({
  selector: 'app-patient-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-page.component.html',
  styleUrls: ['./patient-page.component.css'],
  providers: [{ provide: JWT_OPTIONS, useValue: JWT_OPTIONS }, JwtHelperService]
})
export class PatientChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  doctors: Doctor[] = [];
  doctorsWithLastMessage: Doctor[] = [];
  conversation: ChatMessage[] = [];

  patientId!: string;
  patientName: string = '';
  replyingToId!: string;
  replyingToName!: string;
  newMessage: string = '';
  currentConversationId: string = '';
  currentUserId: string = ''; // ← Gönderici ID’si

  constructor(
    private signalRService: SignalRService,
    private http: HttpClient,
    private jwtHelper: JwtHelperService
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = this.jwtHelper.decodeToken(token);
      this.patientId = decoded['nameid'];
    }
    if (!this.patientId) this.patientId = localStorage.getItem('patientId') || '';
    this.currentUserId = this.patientId;

    this.getPatientName();
    this.loadDoctors();

    this.signalRService.startConnection()
      .then(() => {
        console.log('SignalR bağlandı ✅');

        // Anlık mesajları dinle
        this.signalRService.addReceiveMessageListener((msg: ChatMessage) => {
          if (msg.conversationId === this.currentConversationId) {
            if (msg.senderId === this.patientId) msg.senderName = 'Siz';
            this.conversation.push(msg);
            this.scrollToBottom();
          }

          const otherId = msg.senderId === this.patientId ? msg.receiverId : msg.senderId;
          this.updateDoctorLastMessage(otherId, msg.message, msg.sentAt);
        });
      })
      .catch(err => console.error('SignalR başlatma hatası:', err));
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  getPatientName(): void {
    this.http.get<any>(`http://localhost:5073/api/Patient/GetPatientById/${this.patientId}`)
      .subscribe({
        next: res => this.patientName = res.data?.fullName || '',
        error: err => this.patientName = ''
      });
  }

  loadDoctors(): void {
    this.http.get<any>('http://localhost:5073/api/Doctor/GetAllDoctors')
      .subscribe({
        next: res => {
          this.doctors = res.data.map((d: any) => ({ id: d.id, fullName: d.fullName }));
          this.doctorsWithLastMessage = [...this.doctors];

          if (this.doctors.length > 0) this.openConversation(this.doctors[0]);
        },
        error: err => console.error('Doktorlar yüklenemedi', err)
      });
  }

  private generateConversationId(userId1: string, userId2: string): string {
    return userId1 < userId2 ? `${userId1}_${userId2}` : `${userId2}_${userId1}`;
  }

  openConversation(doctor: Doctor): void {
    this.replyingToId = doctor.id;
    this.replyingToName = doctor.fullName;
    this.currentConversationId = this.generateConversationId(this.patientId, doctor.id);

    // SignalR grubuna katıl
    if (this.signalRService.hubConnection?.state === 'Connected') {
      this.signalRService.hubConnection.invoke('JoinConversation', this.currentConversationId)
        .catch(err => console.error('JoinConversation hatası:', err));
    }

    this.signalRService.getOldMessages(this.patientId, doctor.id).subscribe({
      next: res => {
        this.conversation = res.map(m => ({ ...m, sentAt: new Date(m.sentAt) }))
                               .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());

        this.conversation.forEach(msg => {
          if (msg.senderId === this.patientId) msg.senderName = 'Siz';
        });

        this.scrollToBottom();

        if (this.conversation.length > 0) {
          const last = this.conversation[this.conversation.length - 1];
          this.updateDoctorLastMessage(doctor.id, last.message, last.sentAt);
        }
      },
      error: err => console.error('Mesajlar alınamadı', err)
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.replyingToId) return;

    const msg: ChatMessage = {
      senderId: this.patientId,
      senderName: 'Siz',
      receiverId: this.replyingToId.toString(),
      receiverName: this.replyingToName,
      message: this.newMessage,
      sentAt: new Date(),
      conversationId: this.currentConversationId
    };

    // ✨ Gönderici mesajını push etmiyoruz, listener ekleyecek
    if (this.signalRService.hubConnection?.state === 'Connected') {
      this.signalRService.hubConnection.invoke(
        'SendMessage',
        this.currentConversationId,
        msg.senderId,
        msg.senderName,
        msg.receiverId,
        msg.receiverName,
        msg.message
      ).catch(err => console.error('SendMessage hatası:', err));
    }

    this.newMessage = '';
  }

  updateDoctorLastMessage(doctorId: string, message: string, sentAt: Date): void {
    const doctor = this.doctorsWithLastMessage.find(d => d.id === doctorId);
    if (doctor) {
      doctor.lastMessage = message;
      doctor.lastMessageTime = sentAt;
      this.doctorsWithLastMessage.sort(
        (a, b) => (b.lastMessageTime?.getTime() || 0) - (a.lastMessageTime?.getTime() || 0)
      );
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.chatContainer) {
        const container = this.chatContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    } catch (err) { console.error('Scroll hatası:', err); }
  }
}
