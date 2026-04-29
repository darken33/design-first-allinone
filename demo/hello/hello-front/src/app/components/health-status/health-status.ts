import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { HelloService } from '../../services/hello';
import { HealthDto, HealthIndicatorColor, LoadingState } from '../../models/hello-api.models';

@Component({
  selector: 'app-health-status',
  imports: [],
  templateUrl: './health-status.html',
  styleUrl: './health-status.css',
})
export class HealthStatus implements OnInit {
  private readonly helloService = inject(HelloService);

  healthState = signal<LoadingState<HealthDto>>({ status: 'idle' });

  healthData = computed<HealthDto | null>(() => {
    const s = this.healthState();
    return s.status === 'success' ? s.data : null;
  });

  badgeColor = computed<HealthIndicatorColor>(() => {
    const data = this.healthData();
    if (!data) return 'grey';
    if (data.status === 'healthy') return 'green';
    if (data.status === 'degraded') return 'orange';
    return 'red';
  });

  ngOnInit(): void {
    this.healthState.set({ status: 'loading' });
    this.helloService.getHealth().subscribe({
      next: (data) => this.healthState.set({ status: 'success', data }),
      error: (err: Error) => this.healthState.set({ status: 'error', message: err.message }),
    });
  }
}


