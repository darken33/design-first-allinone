import { Component, Input } from '@angular/core';
import { LoadingState, HelloDto } from '../../models/hello-api.models';

@Component({
  selector: 'app-greeting',
  imports: [],
  templateUrl: './greeting.html',
  styleUrl: './greeting.css',
})
export class Greeting {
  @Input() state: LoadingState<HelloDto> = { status: 'idle' };
}

