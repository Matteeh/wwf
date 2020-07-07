import { Injectable } from "@angular/core";
import { YoutubePlayerService } from "./youtube-player.service";

@Injectable({
  providedIn: "root",
})
export class ChannelVideoStateService {
  constructor(private youtubePlayerService: YoutubePlayerService) {}

  onStateChange(
    videoId: string,
    videoStatus: string,
    playerIsPlaying: boolean,
    currentTime: number
  ) {
    switch (videoStatus) {
      case "play":
        this.onPlay(playerIsPlaying, currentTime);
        break;
      case "cue":
        this.onCue(videoId, currentTime);
        break;
      case "pause":
        this.onPause();
        break;
      case "stop":
        this.onStop();
        break;
    }
  }

  private onPlay(playerIsPlaying: boolean, currentTime: number) {
    if (!playerIsPlaying) {
      this.youtubePlayerService.seekTo(currentTime || 0);
      this.youtubePlayerService.play();
    } else {
      this.youtubePlayerService.seekTo(currentTime || 0);
    }
  }

  private onCue(videoId: string, startSeconds: number) {
    this.youtubePlayerService.loadVideoById(videoId, startSeconds);
    this.youtubePlayerService.play();
  }

  private onPause() {
    this.youtubePlayerService.pause();
  }

  private onStop() {}
}
