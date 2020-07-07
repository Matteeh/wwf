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
import { Subscription, Observable, from, of } from "rxjs";

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
  playerIsPlaying = false;
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
          // Condition is met initially or on join new channel click
          if (this.channel.uid !== channelUid) {
            this.channel.uid = channelUid;
            // Only execute on video page initialization
            return this.initVideoPage(channelUid);
            // Destroy Player here and re init it
          }
          // Otherwise continue
          return of(null);
        }),
        switchMap(() => this.channelService.getChannel(this.channel.uid))
      )
      .subscribe((channel) => {
        console.log("CHANNEL", channel);
        this.setChannel(channel);
        if (this.channel.video.videoId) {
          this.onChannelVideoStatus(this.channel.video.videoStatus);
        }
      });
  }

  /* 
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
  */

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
    this.channel.video.currentTime = 0;
    this.channel.video.videoStatus = "cue";
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

  playerSeekto(time: number) {
    if (this.player && this.player["seekTo"]) {
      if (this.isHost) {
        this.channel.video.isPlaying = true;
        this.channelService.setChannel(this.channel);
      }
      this.player["seekTo"](time, true);
    }
  }

  pauseYoutubeVideo() {
    if (this.player && this.player["pauseVideo"]) {
      this.player["pauseVideo"]();
    }
  }

  loadYoutubeVideoById() {
    if (this.player && this.player["loadVideoById"]) {
      this.player["cueVideoById"]({
        videoId: this.channel.video.videoId,
        startSeconds: this.channel.video.currentTime || 0,
      });
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
    console.log(this.player);
  }

  /**
   * Event emitted from youtube component on player state changed
   */
  onYoutubePlayerStateChange(event) {
    console.log("state changed", event);
    switch (event) {
      case "PLAYING":
        if (this.isHost) {
          this.channel.video.videoStatus = "play";
          // this.channel.video.currentTime = this.getCurrentTime();
          this.channel.video.isPlaying = true;
          this.channelService.setChannel(this.channel);
          // this.playerSeekto(this.getCurrentTime());
          // this.playYoutubeVideo();
        }
        this.playerIsPlaying = true;
        if (this.getCurrentTime() == 0) {
          console.log("started" + this.getCurrentTime());
        } else {
          console.log("playing" + this.getCurrentTime());
        }
        break;
      case "PAUSED":
        this.playerIsPlaying = false;
        console.log(`paused @ ${this.getCurrentTime()}`);
        if (this.isHost) {
          this.channel.video.videoStatus = "pause";
          this.channel.video.currentTime = this.getCurrentTime();
          this.channelService.setChannel(this.channel);
        }
        break;
      case "ENDED":
        this.playerIsPlaying = false;
        if (this.isHost) {
          this.channel.video.videoStatus = "end";
          this.channel.video.currentTime = null;
          this.channelService.setChannel(this.channel);
        }
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
      this.channel.video.currentTime = 0;
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
   * Executes on video page initialization, setups controller variables and checks that the channel route is valid
   */
  private initVideoPage(channelUid: string): Observable<any> {
    return from(
      Promise.all([
        this.channelService.getChannelUsers(channelUid),
        this.validateRoute(channelUid),
        this.setUser(),
      ])
    ).pipe(
      switchMap(([channelUsers]) =>
        this.channelService.addChannelUser(
          this.channel.uid,
          channelUsers,
          this.user.uid
        )
      ),
      tap(() => this.setIsHost(this.user.username))
    );
  }

  private onChannelVideoStatus(videoStatus: string) {
    switch (videoStatus) {
      case "play":
        if (!this.playerIsPlaying) {
          this.playerSeekto(this.channel.video.currentTime || 0);
          this.playYoutubeVideo();
        } else {
          this.playerSeekto(this.channel.video.currentTime || 0);
          if (this.isPlayerCurrentTimeCorrect() && !this.isHost) {
            console.log("Should correct time");
          }
        }

        break;
      case "cue":
        this.loadYoutubeVideoById();
        this.playYoutubeVideo();
        break;
      case "pause":
        this.pauseYoutubeVideo();
        break;
      case "stop":
        break;
    }
  }

  private isPlayerCurrentTimeCorrect(): boolean {
    const currentTime = this.getCurrentTime();
    if (
      currentTime - 2 > this.channel.video.currentTime ||
      currentTime + 2 < this.channel.video.currentTime
    ) {
      return false;
    }
    return true;
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
   * If user not found channel is invalid
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
