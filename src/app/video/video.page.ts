import { Component, OnInit, OnDestroy } from "@angular/core";
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
  first,
  take,
} from "rxjs/operators";
import { User } from "../models/user.model";
import { Channel } from "../models/channel.model";
import { ChannelService } from "../services/channel.service";
import { PresenceService } from "../services/presence.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-video",
  templateUrl: "./video.page.html",
  styleUrls: ["./video.page.scss"],
})
export class VideoPage implements OnInit, OnDestroy {
  counter: number = 0;
  isHost = false;
  user: User = {
    username: null,
    email: null,
    uid: null,
    isReady: null,
    status: { status: null, timestamp: null },
  };

  channel: Channel;

  videos: any[] = [];
  videoId: any;
  YT: any;
  player: any;
  reframed = false;
  videoIsPlaying = false;

  subscription: Subscription;
  constructor(
    private youtubeService: YoutubeService,
    private authService: AuthService,
    private userService: UserService,
    private channelService: ChannelService,
    private router: Router,
    private presence: PresenceService
  ) {
    this.presence.initPresenceSubscriptions();
  }

  async ngOnInit() {
    const channelUid = this.router.url.substr(1);
    const [channelUsers] = await Promise.all([
      this.channelService.getChannelUsers(channelUid),
      this.validateRoute(channelUid),
      this.setUser(),
    ]);
    this.setIsHost(this.user.username);

    this.subscription = this.channelService
      .addChannelUser(channelUid, channelUsers, this.user.uid)
      .pipe(switchMap(() => this.channelService.getChannel(channelUid)))
      .subscribe((channel) => {
        this.setChannel(channel);
        console.log(this.channel);
        if (
          this.channel &&
          this.channel.video &&
          this.channel.video.videoStatus === "play" &&
          this.channel.video.videoId
        ) {
          this.startVideo();
        }
      });
  }

  /**
   * Sets the video id locally and in the db
   */
  setVideoId(e) {
    console.log(e);
    this.videoId = e;
    this.channelService.updateChannelVideoId(this.channel, e);
    console.log(this.videoId);
  }

  /**
   * On start video click
   */
  startVideoClick() {
    this.channelService.updateChannelPlayStatus(this.channel.uid, "play");
  }

  /**
   * Starts the youtube video player
   */
  startVideo() {
    this.reframed = false;
    this.player = new window["YT"].Player("player", {
      videoId: this.channel.video.videoId,
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

  /**
   * Hook for youtube video player
   */
  onPlayerReady(event) {
    console.log(event);
    event.target.playVideo();
  }

  /**
   * State handler for the youtube video player
   */
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
        console.log(this.player);
        if (
          this.player.playerInfo.duration -
            this.player.playerInfo.currentTime !=
          0
        ) {
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

  /**
   * Cleans time for the youtube video player
   */
  cleanTime() {
    return Math.round(this.player.playerInfo.currentTime);
  }

  /**
   * Error handler for the youtube video player
   */
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

  /**
   * Handles the user input from the search-bar component
   */
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

  ngOnDestroy() {
    console.log("destroy", this.user);
    if (this.isHost) {
      this.channelService.updateChannelVideoId(this.channel, "");
      this.channelService.updateChannelPlayStatus(this.channel.uid, "stop");
      this.channelService.removeChannelUser(
        this.channel.uid,
        this.channel.users,
        this.user
      );
      this.subscription.unsubscribe();
    }
  }

  /**
   *
   * Sets the channel property
   */
  private setChannel({
    uid,
    hostIsOnline,
    users,
    status,
    video,
  }: Channel): void {
    this.channel = {
      uid,
      hostIsOnline,
      users: users ? [...users] : null,
      status: { ...status } || { status: null, timestamp: null },
      video: video
        ? {
            videoId: video.videoId,
            videoStatus: video.videoStatus,
            canPlay: video.canPlay,
            started: video.started,
            duration: video.duration,
            currentTime: video.currentTime,
          }
        : {},
    };
  }

  private async validateRoute(channelUid) {
    try {
      const userExist = await this.userService.getUserByUsername(channelUid);
      if (!userExist.length) this.router.navigate(["/channel-not-found"]);
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Sets the user to a clean new object drops all refrences
   */
  private async setUser(): Promise<any> {
    try {
      const {
        uid,
        username,
        email,
        isReady,
        status,
      }: User = await this.authService.getUser();
      if (!uid) {
        // Navigate away if no user
        return this.router.navigate["/sign-in"];
      }
      this.user = {
        uid,
        username,
        email,
        isReady: isReady || null,
        status,
      };
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Evaluates if user is host of current channel
   */
  private setIsHost(username: string): void {
    console.log(`${username}` === this.router.url.substr(1) ? true : false);
    this.isHost = `${username}` === this.router.url.substr(1) ? true : false;
  }
}
