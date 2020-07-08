import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";

@Component({
  selector: "app-video-card",
  templateUrl: "./video-card.component.html",
  styleUrls: ["./video-card.component.scss"],
})
export class VideoCardComponent implements OnInit {
  @Input() video;
  @Output() videoId = new EventEmitter<string>();

  constructor() {}

  ngOnInit() {}

  /**
   * Emit card click event to parent
   */
  onCardClick(e) {
    return this.videoId.emit(this.video.id.videoId);
  }
}
