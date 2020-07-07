import { Injectable } from "@angular/core";
import { YoutubePlayerService } from "./youtube-player.service";
import { VideoStatus } from "src/app/models/channel.model";
import { YoutubePlayerStateService } from "./youtube-player-state.service";

@Injectable({
  providedIn: "root",
})
export class ChannelVideoStateService {
  constructor(
    private youtubePlayerService: YoutubePlayerService,
    private youtubePlayerStateService: YoutubePlayerStateService
  ) {}

  onStateChange(
    videoId: string,
    videoStatus: string,
    playerIsPlaying: boolean,
    currentTime: number
  ) {
    switch (videoStatus) {
      case VideoStatus.PLAY:
        this.onPlay(videoId, playerIsPlaying, currentTime);
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

  private onPlay(
    videoId: string,
    playerIsPlaying: boolean,
    currentTime: number
  ) {
    if (this.youtubePlayerStateService.playerIsReady && !playerIsPlaying) {
      if (!this.youtubePlayerService.getVideoData().title) {
        return this.loadByIdAndPlay(videoId, currentTime);
      }
      this.youtubePlayerService.seekTo(currentTime || 0);
      this.youtubePlayerService.play();
    } else if (
      this.youtubePlayerStateService.playerIsReady &&
      playerIsPlaying
    ) {
      this.youtubePlayerService.seekTo(currentTime || 0);
    }
  }

  private onCue(videoId: string, startSeconds: number) {
    this.loadByIdAndPlay(videoId, startSeconds);
  }

  private onPause() {
    this.youtubePlayerService.pause();
  }

  private onStop() {}

  private loadByIdAndPlay(videoId: string, startSeconds: number) {
    this.youtubePlayerService.loadVideoById(videoId, startSeconds);
    this.youtubePlayerService.play();
  }
}
