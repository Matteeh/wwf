import { Injectable } from "@angular/core";
import { ChannelService } from "src/app/services/channel.service";
import { Channel } from "src/app/models/channel.model";

@Injectable({
  providedIn: "root",
})
export class YoutubePlayerStateService {
  playerIsPlaying: boolean = false;

  constructor(private channelService: ChannelService) {}

  /**
   * Event emitted from youtube component on player error
   */
  onPlayerError(event, channel) {
    // On error stop video and update
    channel.video.videoStatus = "stop";
    this.channelService.setChannel(channel);
  }

  onPlayerStateChange(
    event: string,
    isHost: boolean,
    channel: Channel,
    playerCurrentTime: number
  ) {
    switch (event) {
      case "PLAYING":
        this.onPlaying(isHost, channel, playerCurrentTime);
        break;
      case "PAUSED":
        this.onPaused(isHost, channel, playerCurrentTime);
        break;
      case "ENDED":
        this.onEnded(isHost, channel);
        break;
    }
  }

  /**
   * On Youtube player playing state
   */
  private onPlaying(
    isHost: boolean,
    channel: Channel,
    playerCurrentTime: number
  ) {
    if (isHost) {
      channel.video.videoStatus = "play";
      channel.video.isPlaying = true;
      this.channelService.setChannel(channel);
    }
    this.playerIsPlaying = true;
    if (playerCurrentTime == 0) {
      console.log(`started ${playerCurrentTime}`);
    } else {
      console.log(`playing ${playerCurrentTime}`);
    }
  }

  /**
   * On Youtube player paused state
   */
  private onPaused(
    isHost: boolean,
    channel: Channel,
    playerCurrentTime: number
  ) {
    this.playerIsPlaying = false;
    console.log(`paused @ ${playerCurrentTime}`);
    if (isHost) {
      channel.video.videoStatus = "pause";
      channel.video.currentTime = playerCurrentTime;
      this.channelService.setChannel(channel);
    }
  }

  /**
   * On Youtube player ended state
   */
  private onEnded(isHost: boolean, channel: Channel) {
    this.playerIsPlaying = false;
    if (isHost) {
      channel.video.videoStatus = "end";
      channel.video.currentTime = null;
      this.channelService.setChannel(channel);
    }
  }
}
