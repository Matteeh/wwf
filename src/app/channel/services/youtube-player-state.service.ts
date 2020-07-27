import { Injectable } from "@angular/core";
import { ChannelService } from "src/app/services/channel.service";
import {
  Channel,
  VideoStatus,
  ChannelVideo,
} from "src/app/models/channel.model";
import { YoutubePlayerService } from "./youtube-player.service";
import { ChannelVideoService } from "src/app/services/channel-video.service";

@Injectable({
  providedIn: "root",
})
export class YoutubePlayerStateService {
  playerIsPlaying: boolean = false;
  playerIsReady: boolean = false;
  constructor(
    private channelService: ChannelService,
    private channelVideoService: ChannelVideoService,
    private youtubePlayerService: YoutubePlayerService
  ) {}

  /**
   * Event emitted from youtube component on player error
   */
  onPlayerError(event: string, channelUid: string, channelVideo: ChannelVideo) {
    // On error stop video and update
    console.log("ERROR", event);
    channelVideo.videoStatus = VideoStatus.STOP;
    this.channelVideoService.updateChannelVideo(channelUid, {
      ...channelVideo,
    });
  }

  onPlayerStateChange(
    event: string,
    channelUid: string,
    isHost: boolean,
    channelVideo: ChannelVideo,
    playerCurrentTime: number
  ) {
    switch (event) {
      case "IFRAME_READY":
        console.log("IFRAME READY");
        this.youtubePlayerService.createPlayer(channelUid);
        break;
      case "READY":
        this.playerIsReady = true;
        break;
      case "PLAYING":
        this.onPlaying(isHost, channelUid, channelVideo, playerCurrentTime);
        break;
      case "PAUSED":
        this.onPaused(isHost, channelUid, channelVideo, playerCurrentTime);
        break;
      case "ENDED":
        this.onEnded(isHost, channelUid, channelVideo);
        break;
      case "ERROR":
        this.onPlayerError(event, channelUid, channelVideo);
    }
  }

  /**
   * On Youtube player playing state
   */
  private onPlaying(
    isHost: boolean,
    channelUid: string,
    channelVideo: ChannelVideo,
    playerCurrentTime: number
  ) {
    if (isHost) {
      this.setChannelVideoData(
        VideoStatus.PLAY,
        playerCurrentTime,
        true,
        channelUid,
        channelVideo
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
    channelUid: string,
    channelVideo: ChannelVideo,
    playerCurrentTime: number
  ) {
    this.playerIsPlaying = false;
    console.log(`paused @ ${playerCurrentTime}`);
    if (isHost) {
      this.setChannelVideoData(
        VideoStatus.PAUSE,
        playerCurrentTime,
        false,
        channelUid,
        channelVideo
      );
    }
  }

  /**
   * On Youtube player ended state
   */
  private onEnded(
    isHost: boolean,
    channelUid: string,
    channelVideo: ChannelVideo
  ) {
    this.playerIsPlaying = false;
    if (isHost) {
      this.setChannelVideoData(
        VideoStatus.STOP,
        0,
        false,
        channelUid,
        channelVideo
      );
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
    channelUid: string,
    channelVideo: ChannelVideo
  ) {
    const chVideo: ChannelVideo = { ...channelVideo };
    chVideo.videoStatus = videoStatus;
    chVideo.currentTime = currentTime;
    chVideo.isPlaying = isPlaying;
    this.channelVideoService.updateChannelVideo(channelUid, chVideo);
  }
}
