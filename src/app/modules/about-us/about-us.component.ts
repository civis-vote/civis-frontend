import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-about-us",
  templateUrl: "./about-us.component.html",
  styleUrls: [
    "./css/normalize.css",
    "./css/webflow.css",
    "./css/civis-about-page.webflow.css",
  ],
})
export class AboutUsComponent implements OnInit {
  openVideoModal: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  playVideo() {
    this.openVideoModal = true;
  }

  closeVideo() {
    this.openVideoModal = false;
  }
}
