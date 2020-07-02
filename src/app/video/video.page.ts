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

  channel: Channel = {
    uid: null,
    users: null,
    hostIsOnline: null,
    status: { status: null, timestamp: null },
    video: {
      canPlay: null,
      currentTime: null,
      duration: null,
      started: null,
      videoId: null,
      videoStatus: null,
      isPlaying: null,
    },
  };
  videos: any[] = [];
  YT: any;
  player: any;
  reframed = false;
  videoIsPlaying = false;
  playerReady = false;

  channelSubscription: Subscription;
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
    // Setup youtube iframe listener first
    window["onYouTubeIframeAPIReady"] = () => this.initPlayer();
    const channelUid = this.router.url.substr(1);
    const [channelUsers] = await Promise.all([
      this.channelService.getChannelUsers(channelUid),
      this.validateRoute(channelUid),
      this.setUser(),
    ]);
    await this.channelService.addChannelUser(
      channelUid,
      channelUsers,
      this.user.uid
    );
    this.setIsHost(this.user.username);

    this.channelSubscription = this.channelService
      .getChannel(channelUid)
      .subscribe((channel) => {
        if (this.player && this.player["getCurrentTime"]) {
          /*
          const currentTime = this.player.getCurrentTime();
          const duration = this.player.getDuration();
          if (currentTime && duration) {
            this.channel.video.currentTime = currentTime;
            this.channel.video.duration = duration;
          }
          */
        }
        this.setChannel(channel);
        console.log(this.channel);

        if (
          this.playerReady &&
          this.channel.video.videoStatus === "play" &&
          this.channel.video.videoId
        ) {
          if (!this.channel.video.isPlaying) {
            this.loadYoutubeVideoById();
            this.playYoutubeVideo();
          } else {
            this.loadYoutubeVideoById();
            this.playYoutubeVideoAt(this.channel.video.currentTime);
          }
        }
      });
  }

  /**
   * Sets the video id locally and in the db
   */
  setVideoId(e) {
    if (this.channel.video) {
      this.channel.video.videoId = e;
    } else {
      this.channel.video = {};
      this.channel.video.videoId = e;
    }
    this.channelService.setChannel(this.channel);
  }

  playYoutubeVideo() {
    console.log(this.player);
    if (this.player && this.player["playVideo"]) {
      console.log("PLAYER FOUND CALLING PLAYVIDEO", this.channel.video.videoId);
      this.player.playVideo();
      if (this.isHost) {
        this.channel.video.isPlaying = true;
        this.channelService.setChannel(this.channel);
      }
    }
  }

  playYoutubeVideoAt(time: number) {
    if (this.player && this.player["playVideoAt"]) {
      this.player["playVideoAt"](time);
    }
  }

  loadYoutubeVideoById() {
    if (this.player && this.player["loadVideoById"]) {
      this.player["loadVideoById"](this.channel.video.videoId);
    }
  }

  /**
   * On start video click
   */
  startVideoClick() {
    this.channel.video.videoStatus = "play";
    this.channelService.setChannel(this.channel);
  }

  /**
   * Starts the youtube video player
   */
  initPlayer() {
    console.log("INIT YOUTUBE PLAYER");
    this.reframed = false;
    this.player = new window["YT"].Player("player", {
      videoId: "",
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
    this.playerReady = true;
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
    // On error stop video and update
    this.channel.video.videoStatus = "stop";
    this.channelService.setChannel(this.channel);
    /*
    switch (event.data) {
      case 2:
        break;
      case 100:
        break;
      case 101 || 150:
        break;
    }
    */
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
    if (this.isHost) {
      this.channel.video.videoId = "";
      this.channel.video.videoStatus = "stop";
      this.channelService.setChannel(this.channel);
      this.channelService.removeChannelUser(
        this.channel.uid,
        this.channel.users,
        this.user
      );
      this.channelSubscription.unsubscribe();
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
