import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { SignalRService, ChatMessage } from '../../Services/signalr.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';

interface Patient {
  id: string;
  fullName: string;
  lastMessage?: string;
  lastMessageTime?: Date;
}

@Component({
  selector: 'app-doctor-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-chat.component.html',
  styleUrls: ['./doctor-chat.component.css'],
  providers: [{ provide: JWT_OPTIONS, useValue: JWT_OPTIONS }, JwtHelperService]
})
export class DoctorChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  patients: Patient[] = [];
  patientsWithLastMessage: Patient[] = [];
  conversation: ChatMessage[] = [];

  doctorId!: string;
  doctorName: string = '';
  replyingToId!: string;
  replyingToName!: string;
  currentConversationId: string = '';
  currentUserId: string = '';
  newMessage: string = '';

  constructor(
    private signalRService: SignalRService,
    private http: HttpClient,
    private jwtHelper: JwtHelperService
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = this.jwtHelper.decodeToken(token);
      this.doctorId = decoded['nameid'];
    }
    if (!this.doctorId) this.doctorId = localStorage.getItem('doctorId') || '';
    this.currentUserId = this.doctorId;

    this.getDoctorName();
    this.initializeChat();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  // 🔥 YENİ: Chat başlatma metodu
  private initializeChat(): void {
    // Önce SignalR bağlantısını başlat
    this.signalRService.startConnection()
      .then(() => {
        console.log('SignalR bağlandı ✅');

        // Anlık mesajları dinle
        this.signalRService.addReceiveMessageListener((msg: ChatMessage) => {
          if (msg.conversationId === this.currentConversationId) {
            if (msg.senderId === this.doctorId) msg.senderName = 'Siz';
            this.conversation.push(msg);
            this.scrollToBottom();
          }

          const otherId = msg.senderId === this.doctorId ? msg.receiverId : msg.senderId;
          this.updatePatientLastMessage(otherId, msg.message, msg.sentAt);
        });

        // SignalR bağlandıktan sonra hastaları yükle
        this.loadPatients();
      })
      .catch(err => console.error('SignalR başlatma hatası:', err));
  }

  getDoctorName(): void {
    this.http.get<any>(`http://localhost:5073/api/Doctor/GetDoctorById/${this.doctorId}`)
      .subscribe({
        next: res => this.doctorName = res.data?.fullName || '',
        error: err => this.doctorName = ''
      });
  }

  // 🔥 GÜNCELLENENE: Hastaları yükle ve ilk hastanın mesajlarını otomatik aç
  loadPatients(): void {
    this.http.get<any>('http://localhost:5073/api/Patient/GetAllPatients')
      .subscribe({
        next: res => {
          this.patients = res.data.map((p: any) => ({ id: p.id, fullName: p.fullName }));
          this.patientsWithLastMessage = [...this.patients];

          // 🔥 İLK HASTANIN MESAJLARINI OTOMATIK YÜK
          if (this.patients.length > 0) {
            this.loadAllPatientsLastMessages(); // Tüm hastaların son mesajlarını yükle
            this.openConversation(this.patients[0]); // İlk hastayı otomatik seç
          }
        },
        error: err => console.error('Hastalar yüklenemedi', err)
      });
  }

  // 🔥 YENİ: Tüm hastaların son mesajlarını yükle
  private loadAllPatientsLastMessages(): void {
    this.patients.forEach(patient => {
      this.signalRService.getOldMessages(this.doctorId, patient.id).subscribe({
        next: messages => {
          if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            this.updatePatientLastMessage(patient.id, lastMessage.message, new Date(lastMessage.sentAt));
          }
        },
        error: err => console.error(`${patient.fullName} için mesajlar alınamadı:`, err)
      });
    });
  }

  private generateConversationId(userId1: string, userId2: string): string {
    return userId1 < userId2 ? `${userId1}_${userId2}` : `${userId2}_${userId1}`;
  }

  openConversation(patient: Patient): void {
    this.replyingToId = patient.id;
    this.replyingToName = patient.fullName;
    this.currentConversationId = this.generateConversationId(this.doctorId, patient.id);

    // SignalR grubuna katıl
    if (this.signalRService.hubConnection?.state === 'Connected') {
      this.signalRService.hubConnection.invoke('JoinConversation', this.currentConversationId)
        .catch(err => console.error('JoinConversation hatası:', err));
    }

    // 🔥 GÜNCELLENENE: Mesajları yükle
    this.loadConversationMessages(patient);
  }

  // 🔥 YENİ: Sohbet mesajlarını yükle
  private loadConversationMessages(patient: Patient): void {
    this.signalRService.getOldMessages(this.doctorId, patient.id).subscribe({
      next: res => {
        this.conversation = res.map(m => ({ ...m, sentAt: new Date(m.sentAt) }))
                               .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());

        this.conversation.forEach(msg => {
          if (msg.senderId === this.doctorId) msg.senderName = 'Siz';
        });

        this.scrollToBottom();

        // Son mesajı güncelle
        if (this.conversation.length > 0) {
          const last = this.conversation[this.conversation.length - 1];
          this.updatePatientLastMessage(patient.id, last.message, last.sentAt);
        }
      },
      error: err => console.error('Mesajlar alınamadı', err)
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.replyingToId) return;

    const msg: ChatMessage = {
      senderId: this.doctorId,
      senderName: 'Siz',
      receiverId: this.replyingToId.toString(),
      receiverName: this.replyingToName,
      message: this.newMessage,
      sentAt: new Date(),
      conversationId: this.currentConversationId
    };

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

  updatePatientLastMessage(patientId: string, message: string, sentAt: Date): void {
    const patient = this.patientsWithLastMessage.find(p => p.id === patientId);
    if (patient) {
      patient.lastMessage = message;
      patient.lastMessageTime = sentAt;
      this.patientsWithLastMessage.sort(
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