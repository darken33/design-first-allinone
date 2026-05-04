import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { HelloDto, HealthDto, ApiErrorResponse } from '../models/hello-api.models';

@Injectable({
  providedIn: 'root',
})
export class HelloService {
  private readonly http = inject(HttpClient);

  getGreeting(): Observable<HelloDto> {
    return this.http.get<HelloDto>('/api/v1/hello').pipe(
      catchError(this.handleError)
    );
  }

  getPersonalizedGreeting(name: string): Observable<HelloDto> {
    return this.http.get<HelloDto>(`/api/v1/hello/${encodeURIComponent(name)}`).pipe(
      catchError(this.handleError)
    );
  }

  getHealth(): Observable<HealthDto> {
    return this.http.get<HealthDto>('/health').pipe(
      catchError(this.handleError)
    );
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    const apiError = err.error as Partial<ApiErrorResponse>;
    const message = apiError?.message ?? "Une erreur s'est produite. Veuillez réessayer.";
    return throwError(() => new Error(message));
  }
}

