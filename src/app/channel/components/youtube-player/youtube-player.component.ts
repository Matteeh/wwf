import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { UserVolume } from "src/app/models/user.model";
import { Observable, Subject } from "rxjs";

@Component({
  selector: "app-youtube-player",
  templateUrl: "./youtube-player.component.html",
  styleUrls: ["./youtube-player.component.scss"],
})
export class YoutubePlayerComponent implements OnInit {
  @Output() youtubePlayerReady = new EventEmitter<boolean>();
  @Output() playerError = new EventEmitter<any>();
  @Output() playerStateChange = new EventEmitter<string>();
  @Output() playButtonClick = new EventEmitter<any>();
  @Output() volumeButtonClick = new EventEmitter<any>();
  @Output() volumeRangeChange = new EventEmitter<number>();
  @Output() videoRangeClick = new EventEmitter<number>();

  @Input() playerId: string;
  @Input() isPlaying: boolean;
  @Input() playerIsReady: boolean;
  @Input() volume: number;
  @Input() muted: boolean;
  @Input() videoCurrentTimeWatcher: Subject<number>;
  @Input() videoDuration: number;
  hideControlsTimeout;

  showControls = false;

  constructor() {}

  ngOnInit() {}

  onMouseOverControlsWrapper(e) {
    // console.log(this.hideControlsTimeout);
    this.showControls = true;
    /*if (this.hideControlsTimeout) {
      clearTimeout(this.hideControlsTimeout);
    }
    this.hideControlsTimeout = setTimeout(() => {
      this.showControls = false;
    }, 5000);*/
  }

  onMouseOutControlsWrapper(e) {
    this.showControls = false;
    // clearTimeout(this.hideControlsTimeout);
  }

  /**
   * Emits a string on play button click
   */
  onPlayButtonClick(): void {
    this.playButtonClick.emit();
  }

  onVolumeButtonClick() {
    this.volumeButtonClick.emit();
  }

  onVolumeRangeChange(volume: number) {
    this.volumeRangeChange.emit(volume);
  }

  onVideoRangeClick(clickedTime: number): void {
    this.videoRangeClick.emit(clickedTime);
  }
}
