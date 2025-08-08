// src/app/components/chatbox/chatbox.component.ts
import { Component } from '@angular/core';
import { ChatService } from '../../Services/chat.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-chatbox',
  standalone: true,
  templateUrl: './chatbox.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./chatbox.component.css']
})
export class ChatboxComponent {
  messages: { sender: 'user' | 'bot', text: string }[] = [];
  inputText: string = '';
  loading = false;

  constructor(private chatService: ChatService) {}

  sendMessage() {
    if (!this.inputText.trim()) return;

    const userMsg = this.inputText.trim();
    this.messages.push({ sender: 'user', text: userMsg });
    this.inputText = '';
    this.loading = true;

    this.chatService.sendMessage(userMsg).subscribe({
      next: (response) => {
        this.messages.push({ sender: 'bot', text: response.trim() });
        this.loading = false;
      },
      error: (err) => {
        this.messages.push({ sender: 'bot', text: '❌ Hata oluştu: ' + err.message });
        this.loading = false;
      }
    });
  }
}
