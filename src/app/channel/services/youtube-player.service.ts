import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class YoutubePlayerService {
  player: any;
  playerStateWatcher: Subject<string> = new Subject();
  iframeInitialized = false;
  constructor() {
    window["onYouTubeIframeAPIReady"] = () =>
      this.playerStateWatcher.next("IFRAME_READY");
    this.IframeApiInit();
  }

  /**
   * Initialize the youtube iframe api
   */
  IframeApiInit() {
    if (!this.iframeInitialized) {
      var tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      this.iframeInitialized = true;
    } else {
      window["onYouTubeIframeAPIReady"]();
    }
  }

  /**
   * Starts the youtube video player
   */
  initPlayer() {
    console.log("i run on join user");
    this.player = new window["YT"].Player("player", {
      videoId: "",
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        fs: 1,
        disablekb: 0,
        enablejsapi: 1,
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
    console.log(this.player);
    this.playerStateWatcher.next("READY");
  }

  /**
   * State handler for the youtube video player
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
