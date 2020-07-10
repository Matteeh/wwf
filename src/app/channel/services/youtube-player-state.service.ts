import { Injectable } from "@angular/core";
import { ChannelService } from "src/app/services/channel.service";
import { Channel, VideoStatus } from "src/app/models/channel.model";
import { YoutubePlayerService } from "./youtube-player.service";

@Injectable({
  providedIn: "root",
})
export class YoutubePlayerStateService {
  playerIsPlaying: boolean = false;
  playerIsReady: boolean = false;
  constructor(
    private channelService: ChannelService,
    private youtubePlayerService: YoutubePlayerService
  ) {}

  /**
   * Event emitted from youtube component on player error
   */
  onPlayerError(event: string, channel: Channel) {
    // On error stop video and update
    console.log("ERROR", event);
    channel.video.videoStatus = VideoStatus.STOP;
    this.channelService.setChannel(channel);
  }

  onPlayerStateChange(
    event: string,
    isHost: boolean,
    channel: Channel,
    playerCurrentTime: number
  ) {
    switch (event) {
      case "IFRAME_READY":
        console.log("IFRAME READY");
        this.youtubePlayerService.createPlayer(channel.uid);
        break;
      case "READY":
        this.playerIsReady = true;
        break;
      case "PLAYING":
        this.onPlaying(isHost, channel, playerCurrentTime);
        break;
      case "PAUSED":
        this.onPaused(isHost, channel, playerCurrentTime);
        break;
      case "ENDED":
        this.onEnded(isHost, channel);
        break;
      case "ERROR":
        this.onPlayerError(event, channel);
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
      this.setChannelVideoData(
        VideoStatus.PLAY,
        playerCurrentTime,
        false,
        channel
      );
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
      this.setChannelVideoData(
        VideoStatus.PAUSE,
        playerCurrentTime,
        false,
        channel
      );
    }
  }

  /**
   * On Youtube player ended state
   */
  private onEnded(isHost: boolean, channel: Channel) {
    this.playerIsPlaying = false;
    if (isHost) {
      this.setChannelVideoData(VideoStatus.STOP, 0, false, channel);
    }
  }

  /**
   * Should be moved to another service
   * @param videoStatus
   * @param currentTime
   * @param isPlaying
   * @param channel
   */
  private setChannelVideoData(
    videoStatus: VideoStatus,
    currentTime: number,
    isPlaying: boolean,
    channel: Channel
  ) {
    const c: Channel = { ...channel };
    c.video.videoStatus = videoStatus;
    c.video.currentTime = currentTime;
    c.video.isPlaying = isPlaying;
    this.channelService.setChannel(c);
  }
}
