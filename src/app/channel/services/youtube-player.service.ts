import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class YoutubePlayerService {
  player: any;
  // Create a new watcher from the component life cycle hook
  playerStateWatcher: Subject<string>;
  iframeInitialized = false;
  constructor() {
    window["onYouTubeIframeAPIReady"] = () =>
      this.playerStateWatcher.next("IFRAME_READY");
  }

  /**
   * Initialize the youtube iframe api
   */
  IframeApiInit() {
    window["YT"] = null;
    var tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    this.iframeInitialized = true;
  }

  /**
   * Starts the youtube video player
   */
  createPlayer(channelUid: string) {
    console.log("creating player");
    this.player = null;
    this.player = new window["YT"].Player(channelUid, {
      videoId: "",
      playerVars: {
        autoplay: 0,
        controls: 0,
        rel: 0,
        fs: 1,
        disablekb: 0,
        enablejsapi: 1,
        showinfo: 0,
      },
      events: {
        onStateChange: this.onPlayerStateChange.bind(this),
        onError: this.onPlayerError.bind(this),
        onReady: this.onPlayerReady.bind(this),
      },
    });
  }

  /**
   * Hook for youtube video player
   */
  onPlayerReady() {
    // this.player.
    this.playerStateWatcher.next("READY");
  }

  /**
   * State change handler for the youtube video player
   */
  onPlayerStateChange(event) {
    switch (event.data) {
      case window["YT"].PlayerState.PLAYING:
        this.playerStateWatcher.next("PLAYING");
        break;
      case window["YT"].PlayerState.PAUSED:
        if (
          this.player.playerInfo.duration -
            this.player.playerInfo.currentTime !=
          0
        ) {
          this.playerStateWatcher.next("PAUSED");
        }
        this.playerStateWatcher.next("ENDED");
        break;
      case window["YT"].PlayerState.ENDED:
        this.playerStateWatcher.next("ENDED");
        break;
    }
  }

  /**
   * Error handler for the youtube video player
   */
  onPlayerError(event) {
    this.playerStateWatcher.next("ERROR");
    // this.playerError.emit(event);
  }

  destroyPlayer() {
    this.player.destroy();
  }

  play() {
    if (this.player && this.player["playVideo"]) {
      this.player.playVideo();
    }
  }

  seekTo(time: number) {
    if (this.player && this.player["seekTo"]) {
      this.player["seekTo"](time, true);
    }
  }

  pause() {
    if (this.player && this.player["pauseVideo"]) {
      this.player["pauseVideo"]();
    }
  }

  toggleMute(muted) {
    if (this.player) {
      if (muted) {
        this.player.unMute();
      } else {
        this.player.mute();
      }
    }
  }

  getVolume() {
    if (this.player) {
      return this.player.getVolume();
    }
  }

  setVolume(volume: number) {
    if (this.player) {
      this.player.setVolume(volume);
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

  getVideoDuration(): number {
    if (this.player) {
      console.log(Math.round(this.player.getDuration()));
      return Math.round(this.player.getDuration());
    }
  }

  /**
   * Get current time
   */
  getCurrentTime(): number {
    if (this.player) {
      return Math.round(this.player.playerInfo.currentTime);
    }
  }

  getVideoData() {
    if (this.player) {
      return this.player.getVideoData();
    }
    return null;
  }
}
