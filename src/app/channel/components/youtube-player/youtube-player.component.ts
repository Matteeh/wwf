import { Component, OnInit, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-youtube-player",
  templateUrl: "./youtube-player.component.html",
  styleUrls: ["./youtube-player.component.scss"],
})
export class YoutubePlayerComponent implements OnInit {
  @Output() youtubePlayerReady = new EventEmitter<boolean>();
  @Output() playerError = new EventEmitter<any>();
  @Output() playerStateChange = new EventEmitter<string>();

  constructor() {}

  ngOnInit() {
    console.log("i run");
  }
}

/* 
 /**
   * Starts the youtube video player
   
  initPlayer() {
    console.log("INIT YOUTUBE PLAYER");
    this.reframed = false;
    this.player = new window["YT"].Player("player", {
      videoId: "",
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        fs: 1,
        disablekb: 0,
        enablejsapi: 1,

        /*
        modestbranding: 1,
        controls: 1,
        disablekb: 1,
        rel: 0,
        showinfo: 0,
        fs: 0,
        playsinline: 1,
        
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
   
  onPlayerReady(event) {
    this.playerStateChange.next("READY");
  }

  /**
   * State handler for the youtube video player
   
  onPlayerStateChange(event) {
    switch (event.data) {
      case window["YT"].PlayerState.PLAYING:
        this.playerStateChange.emit("PLAYING");
        break;
      case window["YT"].PlayerState.PAUSED:
        if (
          this.player.playerInfo.duration -
            this.player.playerInfo.currentTime !=
          0
        ) {
          this.playerStateChange.emit("PAUSED");
        }
        break;
      case window["YT"].PlayerState.ENDED:
        this.playerStateChange.emit("ENDED");
        break;
    }
  }

  /**
   * Error handler for the youtube video player
   
  onPlayerError(event) {
    this.playerError.emit(event);

    /*
    switch (event.data) {
      case 2:
        break;
      case 100:
        break;
      case 101 || 150:
        break;
    }
    
  }
*/
