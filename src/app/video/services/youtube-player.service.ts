import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class YoutubePlayerService {
  player: any;
  constructor() {}

  setPlayer(player) {
    this.player = player;
  }

  play() {
    if (this.player && this.player["playVideo"]) {
      this.player.playVideo();
      /*
      if (this.isHost) {
        this.channel.video.isPlaying = true;
        this.channelService.setChannel(this.channel);
      }
      */
    }
  }

  seekTo(time: number) {
    if (this.player && this.player["seekTo"]) {
      /*
      if (this.isHost) {
        this.channel.video.isPlaying = true;
        this.channelService.setChannel(this.channel);
      }
      */
      this.player["seekTo"](time, true);
    }
  }

  pause() {
    if (this.player && this.player["pauseVideo"]) {
      this.player["pauseVideo"]();
    }
  }

  loadVideoById(videoId: string, startSeconds: number) {
    if (this.player && this.player["loadVideoById"]) {
      this.player["cueVideoById"]({
        videoId: videoId,
        startSeconds: startSeconds || 0,
      });
    }
  }

  /**
   * Get current time
   */
  getCurrentTime() {
    return Math.round(this.player.playerInfo.currentTime);
  }
}
