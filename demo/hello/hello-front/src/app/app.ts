import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HelloService } from './services/hello';
import { Greeting } from './components/greeting/greeting';
import { HealthStatus } from './components/health-status/health-status';
import { LoadingState, HelloDto } from './models/hello-api.models';

@Component({
  selector: 'app-root',
  imports: [Greeting, HealthStatus, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly helloService = inject(HelloService);

  genericState = signal<LoadingState<HelloDto>>({ status: 'idle' });
  personalizedState = signal<LoadingState<HelloDto>>({ status: 'idle' });
  name = '';

  ngOnInit(): void {
    this.genericState.set({ status: 'loading' });
    this.helloService.getGreeting().subscribe({
      next: (data) => this.genericState.set({ status: 'success', data }),
      error: (err: Error) => this.genericState.set({ status: 'error', message: err.message }),
    });
  }

  onSubmit(): void {
    if (!this.name.trim()) return;
    this.personalizedState.set({ status: 'loading' });
    this.helloService.getPersonalizedGreeting(this.name).subscribe({
      next: (data) => this.personalizedState.set({ status: 'success', data }),
      error: (err: Error) => this.personalizedState.set({ status: 'error', message: err.message }),
    });
  }
}


