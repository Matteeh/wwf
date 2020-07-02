import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-youtube-player",
  templateUrl: "./youtube-player.component.html",
  styleUrls: ["./youtube-player.component.scss"],
})
export class YoutubePlayerComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    this.IframeApiInit();
  }

  /**
   * Initialize the youtube iframe api
   */
  IframeApiInit() {
    var tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    // window["onYouTubeIframeAPIReady"] = () => this.startVideo();
  }
}
