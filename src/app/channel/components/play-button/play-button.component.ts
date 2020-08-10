import { Component, EventEmitter, Output, Input } from "@angular/core";

@Component({
  selector: "app-play-button",
  templateUrl: "./play-button.component.html",
  styleUrls: ["./play-button.component.scss"],
})
export class PlayButtonComponent {
  @Output() playButtonClick = new EventEmitter<any>();
  @Input() set playing(isPlaying: boolean) {
    this.isPlaying = isPlaying;
    this.setButtonIcon(isPlaying);
  }
  @Input() disabled: boolean;
  isPlaying: boolean;
  buttonIcon: string;
  constructor() {}

  /**
   * Emits a string on play button click
   */
  onPlayButtonClick(): void {
    this.playButtonClick.emit();
  }

  /**
   * Sets button icon on new playing value
   */
  private setButtonIcon(isPlaying: boolean): void {
    this.buttonIcon = isPlaying ? "pause" : "play";
  }
}
