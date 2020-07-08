import { Injectable } from "@angular/core";
import { YoutubePlayerService } from "./youtube-player.service";
import { VideoStatus, Channel } from "src/app/models/channel.model";
import { YoutubePlayerStateService } from "./youtube-player-state.service";
import { ChannelService } from "src/app/services/channel.service";

@Injectable({
  providedIn: "root",
})
export class ChannelVideoStateService {
  constructor(
    private youtubePlayerService: YoutubePlayerService,
    private youtubePlayerStateService: YoutubePlayerStateService,
    private channelService: ChannelService
  ) {}

  onStateChange(channel: Channel, playerIsPlaying: boolean, isHost: boolean) {
    const { videoStatus, videoId, currentTime } = channel.video;
    switch (videoStatus) {
      case VideoStatus.PLAY:
        this.onPlay(videoId, playerIsPlaying, currentTime, isHost);
        break;
      case VideoStatus.CUE:
        this.onCue(channel);
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
    currentTime: number,
    isHost: boolean
  ) {
    if (this.youtubePlayerStateService.playerIsReady && !playerIsPlaying) {
      if (!this.youtubePlayerService.getVideoData()) {
        this.youtubePlayerService.loadVideoById(videoId, currentTime);
        return this.youtubePlayerService.play();
      }
      this.youtubePlayerService.seekTo(currentTime || 0);
      this.youtubePlayerService.play();
    } else if (
      this.youtubePlayerStateService.playerIsReady &&
      playerIsPlaying
    ) {
      // Host is already playing the video
      if (!isHost) {
        this.youtubePlayerService.seekTo(currentTime || 0);
      }
    }
  }

  private onCue(channel: Channel) {
    const ch = { ...channel };
    this.youtubePlayerService.loadVideoById(
      channel.video.videoId,
      channel.video.currentTime
    );
    ch.video.videoStatus = VideoStatus.PLAY;
    this.channelService.setChannel(ch);
  }

  private onPause() {
    this.youtubePlayerService.pause();
  }

  private onStop() {}
}
