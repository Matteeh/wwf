import { Injectable } from "@angular/core";
import { YoutubePlayerService } from "./youtube-player.service";
import { VideoStatus } from "src/app/models/channel.model";

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
      case VideoStatus.PLAY:
        this.onPlay(playerIsPlaying, currentTime);
        break;
      case VideoStatus.CUE:
        this.onCue(videoId, currentTime);
        break;
      case VideoStatus.PAUSE:
        this.onPause();
        break;
      case VideoStatus.STOP:
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
