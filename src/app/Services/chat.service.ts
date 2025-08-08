import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = 'http://localhost:11434/api/generate';

  constructor(private http: HttpClient) {}

sendMessage(userPrompt: string): Observable<string> {
  const systemPrompt = `Sen bir sağlık asistanısın. Sadece sağlıkla ilgili sorulara cevap ver. Diğer konulara cevap verme.`;

  const fullPrompt = `${systemPrompt}\n\nSoru: ${userPrompt}\nCevap:`;

  const body = {
    model: 'gemma:2b',
    prompt: fullPrompt,
    stream: false
  };

  return this.http.post<any>(this.apiUrl, body).pipe(
    map(res => res.response)
  );
}

}
