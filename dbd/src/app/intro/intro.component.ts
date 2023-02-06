import { AfterContentChecked, AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.css']
})
export class IntroComponent implements OnInit {

  @ViewChild('videoPlayer', { static: false }) videoPlayer!: ElementRef;

  constructor(private _router: Router) { }

  ngOnInit(): void {
  }

  skip() {
    this.videoPlayer.nativeElement.pause();
    this._router.navigate(['/tutorial']);
  }

}
