import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";

@Component({
  selector: "app-youtube-player",
  templateUrl: "./youtube-player.component.html",
  styleUrls: ["./youtube-player.component.scss"],
})
export class YoutubePlayerComponent implements OnInit {
  @Output() youtubePlayerReady = new EventEmitter<boolean>();
  @Output() playerError = new EventEmitter<any>();
  @Output() playerStateChange = new EventEmitter<string>();

  @Input() playerId: string;

  constructor() {}

  ngOnInit() {}
}
