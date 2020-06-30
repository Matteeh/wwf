import { Component, OnInit } from "@angular/core";
import { YoutubeService } from "../services/youtube.service";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";
import { UserService } from "../services/user.service";
import {
  mapTo,
  switchMap,
  debounceTime,
  takeLast,
  delay,
  tap,
  takeWhile,
  takeUntil,
} from "rxjs/operators";
import { User } from "../models/user.model";
import { Channel } from "../models/channel.model";
import { ChannelService } from "../services/channel.service";
import { PresenceService } from "../services/presence.service";

@Component({
  selector: "app-video",
  templateUrl: "./video.page.html",
  styleUrls: ["./video.page.scss"],
})
export class VideoPage implements OnInit {
  counter: number = 0;
  user: User = {
    username: null,
    email: null,
    uid: null,
    isHost: null,
    isReady: null,
    status: { status: null, timestamp: null },
  };

  channel: Channel = {
    uid: null,
    isPlaying: null,
    users: null,
    hostIsOnline: null,
    canPlay: null,
    videoId: null,
    status: { status: null, timestamp: null },
  };

  videos: any[] = [];
  videoId: any;
  YT: any;
  player: any;
  reframed = false;
  videoIsPlaying = false;
  constructor(
    private youtubeService: YoutubeService,
    private authService: AuthService,
    private userService: UserService,
    private channelService: ChannelService,
    private router: Router,
    private presence: PresenceService
  ) {}

  ngOnInit() {
    this.channel.uid = this.router.url.substr(1);
    this.authService.user
      .pipe(
        switchMap((user: any) => {
          this.setUser(user);
          return this.userService.getUserByUsername(user[3]);
        }),
        mapTo(true),
        tap((userExists) =>
          userExists ? "" : this.router.navigateByUrl("/404")
        ),
        switchMap(() => {
          return this.presence.getPresence(this.user.uid);
        }),
        switchMap(() => {
          return this.channelService.updateChannelUsers(
            this.channel,
            this.user
          );
        }),
        switchMap(() => {
          return this.channelService.watchChannelPlayStatus(
            this.router.url.substr(1)
          );
        })
      )
      .subscribe((channel: any) => {
        this.channel = { ...channel };
        if (
          channel.status &&
          channel.status.status === "play" &&
          channel.videoId
        ) {
          this.startVideo();
        }
        this.counter++;
        console.log(channel, "test channel");
        console.log(this.counter);
      });
  }

  setVideoId(e) {
    console.log(e);
    this.videoId = e;
    this.channelService.updateChannelVideoId(this.channel, e);
    console.log(this.videoId);
  }

  startVideoClick() {
    this.channelService.updateChannelPlayStatus(this.channel, "play");
  }

  startVideo() {
    this.reframed = false;
    this.player = new window["YT"].Player("player", {
      videoId: this.channel.videoId,
      playerVars: {
        autoplay: 1,
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

  onPlayerReady(event) {
    event.target.playVideo();
  }

  onPlayerStateChange(event) {
    console.log(event);
    switch (event.data) {
      case window["YT"].PlayerState.PLAYING:
        if (this.cleanTime() == 0) {
          console.log("started" + this.cleanTime());
        } else {
          console.log("playing" + this.cleanTime());
        }
        this.videoIsPlaying = true;
        break;
      case window["YT"].PlayerState.PAUSED:
        if (this.player.getDuration() - this.player.getCurrentTime() != 0) {
          console.log("paused" + "@" + this.cleanTime());
        }
        // this.videoIsPlaying = false;
        break;
      case window["YT"].PlayerState.ENDED:
        console.log("ended");
        this.videoIsPlaying = false;
        break;
    }
  }

  cleanTime() {
    return Math.round(this.player.getCurrentTime());
  }

  onPlayerError(event) {
    switch (event.data) {
      case 2:
        console.log("" + this.videoId);
        break;
      case 100:
        break;
      case 101 || 150:
        break;
    }
  }

  handleSearchValue(searchValue: string) {
    this.youtubeService.listVideos(searchValue).subscribe((list) => {
      this.videos = [];
      console.log("youtube list value", list);
      for (let element of list["items"]) {
        if (element.id.videoId) {
          this.videos.push(element);
        }
      }
    });
  }

  private setUser(user: any[]): void {
    this.user.email = user[0];
    (this.user.status = user[1]), (this.user.uid = user[2]);
    this.user.username = user[3];
    this.setIsHost(user);
  }

  private setIsHost(user: any[]) {
    if (`/${user[3]}` === this.router.url) {
      this.user.isHost = true;
    } else {
      this.user.isHost = false;
    }
  }
}
