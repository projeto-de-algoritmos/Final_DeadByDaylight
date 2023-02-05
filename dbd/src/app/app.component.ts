import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  @ViewChild('videoPlayer', { static: false }) videoPlayer!: ElementRef;

  constructor(private _router: Router) {}

  
}
