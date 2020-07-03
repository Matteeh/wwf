import { Component, OnInit, OnDestroy } from "@angular/core";
import { YoutubeService } from "../services/youtube.service";
import { AuthService } from "../services/auth.service";
import { Router, ParamMap, ActivatedRoute } from "@angular/router";
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
  player: any;
  videos: any[] = [];
  channelSubscription: Subscription;
  constructor(
    private youtubeService: YoutubeService,
    private authService: AuthService,
    private userService: UserService,
    private channelService: ChannelService,
    private route: ActivatedRoute,
    private router: Router,
    private presence: PresenceService
  ) {
    this.presence.initPresenceSubscriptions();
  }

  async ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          const channelUid = params.get("id");
          if (this.channel.uid !== channelUid) {
            this.channel.uid = channelUid;
          }
          return Promise.all([
            this.channelService.getChannelUsers(channelUid),
            this.validateRoute(channelUid),
            this.setUser(),
          ]);
        }),
        switchMap(([channelUsers]) =>
          this.channelService.addChannelUser(
            this.channel.uid,
            channelUsers,
            this.user.uid
          )
        ),
        tap(() => this.setIsHost(this.user.username)),
        switchMap(() => this.channelService.getChannel(this.channel.uid))
      )
      .subscribe((channel) => {
        this.setChannel(channel);
        console.log(this.channel);
        console.log(this.player);
        if (
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
    this.channel.video.videoStatus = "play";
    this.channelService.setChannel(this.channel);
  }

  playYoutubeVideo() {
    if (this.player && this.player["playVideo"]) {
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

  /**
   * Event emitted from youtube component when player is loaded
   */
  onYoutubePlayerReady(event) {
    this.player = event;
  }

  /**
   * Event emitted from youtube component on player state changed
   */
  onYoutubePlayerStateChange(event) {
    switch (event) {
      case event === "PLAYING":
        if (this.getCurrentTime() == 0) {
          console.log("started" + this.getCurrentTime());
        } else {
          console.log("playing" + this.getCurrentTime());
        }
        break;
      case event === "PAUSED":
        console.log(`paused @ ${this.getCurrentTime()}`);
        break;
      case event === "ENDED":
        console.log("ended");
        break;
    }
  }

  /**
   * Event emitted from youtube component on player error
   */
  onYoutubePlayerError(event) {
    // On error stop video and update
    this.channel.video.videoStatus = "stop";
    this.channelService.setChannel(this.channel);
  }

  /**
   * Get current time
   */
  getCurrentTime() {
    return Math.round(this.player.playerInfo.currentTime);
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

  /**
   * If user not found channel is not valid
   */
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

// console.log("NgOnInit");
/*
this.route.paramMap.subscribe((val) =>
  console.log("paramMap", val.get("id"))
);*/
//console.log(params.get('id'));

//const channelUid = this.router.url.substr(1);
/* const [channelUsers] = await Promise.all([
  this.channelService.getChannelUsers(channelUid),
  this.validateRoute(channelUid),
  this.setUser(),
]);
*/
/*
await this.channelService.addChannelUser(
  channelUid,
  channelUsers,
  this.user.uid
);

 console.log("STREAM WORKS", channel);
        if (this.player && this.player["getCurrentTime"]) {
          /*
          const currentTime = this.player.getCurrentTime();
          const duration = this.player.getDuration();
          if (currentTime && duration) {
            this.channel.video.currentTime = currentTime;
            this.channel.video.duration = duration;
          }
          */
