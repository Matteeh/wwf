import { Injectable } from "@angular/core";
import { VideoStatus, ChannelVideo } from "src/app/models/channel.model";
import { YoutubePlayerService } from "./youtube-player.service";
import { ChannelVideoService } from "src/app/services/channel-video.service";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class YoutubePlayerStateService {
  playerIsPlaying = false;
  playerIsReady = false;
  updateVideoCurrentTimeInterval: ReturnType<typeof setInterval>;
  videoCurrentTime: Subject<number> = new Subject<number>();
  videoDuration: number;
  constructor(
    private channelVideoService: ChannelVideoService,
    private youtubePlayerService: YoutubePlayerService
  ) {}

  /**
   * Event emitted from youtube component on player error
   */
  onPlayerError(event: string, channelUid: string, channelVideo: ChannelVideo) {
    this.stopWatchingVideoCurrentTime();
    this.videoDuration = 0;
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
    this.watchVideoCurrentTime();
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
    this.stopWatchingVideoCurrentTime();
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
    this.videoDuration = 0;
    this.stopWatchingVideoCurrentTime();
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

  private watchVideoCurrentTime(): void {
    this.videoDuration = this.youtubePlayerService.getVideoDuration();
    if (!this.updateVideoCurrentTimeInterval) {
      this.updateVideoCurrentTimeInterval = setInterval(() => {
        this.videoCurrentTime.next(this.youtubePlayerService.getCurrentTime());
      }, 1000);
    }
  }

  private stopWatchingVideoCurrentTime(): void {
    clearInterval(this.updateVideoCurrentTimeInterval);
    this.updateVideoCurrentTimeInterval = null;
  }
}
