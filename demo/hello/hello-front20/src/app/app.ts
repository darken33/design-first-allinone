import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
//import { HelloService } from './hello-api/api/hello.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'Appel de l\'api hello';

  // constructor(private helloService: HelloService) {
  //     this.helloService.helloWorld().subscribe(helloDto => {
  //     this.title = helloDto.message!;
  //   });
  // }
}
