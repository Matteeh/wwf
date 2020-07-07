import { Component, OnInit, OnDestroy } from "@angular/core";
import { YoutubeService } from "../services/youtube.service";
import { AuthService } from "../services/auth.service";
import { Router, ParamMap, ActivatedRoute } from "@angular/router";
import { UserService } from "../services/user.service";
import { switchMap, tap } from "rxjs/operators";
import { User } from "../models/user.model";
import { Channel, VideoStatus } from "../models/channel.model";
import { ChannelService } from "../services/channel.service";
import { PresenceService } from "../services/presence.service";
import {
  Subscription,
  Observable,
  from,
  of,
  Subject,
  BehaviorSubject,
} from "rxjs";
import { YoutubePlayerStateService } from "./services/youtube-player-state.service";
import { ChannelVideoStateService } from "./services/channel-video-state.service";
import { YoutubePlayerService } from "./services/youtube-player.service";

const nullChannel = {
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

@Component({
  selector: "app-video",
  templateUrl: "./video.page.html",
  styleUrls: ["./video.page.scss"],
})
export class VideoPage implements OnInit, OnDestroy {
  isHost = false;
  user: User = {
    username: null,
    email: null,
    uid: null,
    isReady: null,
    status: { status: null, timestamp: null },
  };

  channel: Channel = nullChannel;
  playerReadyWatcher: Subject<any> = new Subject();
  videos: any[] = [];
  channelSubscription: Subscription;
  constructor(
    private youtubeService: YoutubeService,
    private authService: AuthService,
    private userService: UserService,
    private channelService: ChannelService,
    private route: ActivatedRoute,
    private router: Router,
    private presence: PresenceService,
    private playerStateService: YoutubePlayerStateService,
    private channelVideoStateService: ChannelVideoStateService,
    private youtubePlayerService: YoutubePlayerService
  ) {
    this.presence.initPresenceSubscriptions();
  }

  async ngOnInit() {
    this.channelSubscription = this.route.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          const channelUid = params.get("id");
          // Condition is met initially or on join new channel click
          if (this.channel.uid !== channelUid) {
            this.channel = nullChannel;
            this.channel.uid = channelUid;
            // Destroy Player here and re init it
            // Only execute on video page initialization
            return this.initVideoPage(channelUid);
          }
          // Otherwise continue
          return of(null);
        }),
        switchMap(() => {
          return this.playerReadyWatcher.asObservable();
        }),
        switchMap((playerReady) => {
          // Set player if its not set
          if (playerReady && !this.playerStateService.playerIsReady) {
            this.youtubePlayerService.initPlayer();
          }
          return this.channelService.getChannel(this.channel.uid);
        }),
        switchMap((channel) => {
          console.log(
            "CHANNEL",
            channel,
            this.playerStateService.playerIsReady
          );
          this.setChannel(channel);
          if (
            this.channel.video.videoId &&
            this.playerStateService.playerIsReady
          ) {
            return this.setHostCurrentTime();
          }
          return of(null);
        })
      )
      .subscribe(() => {
        if (
          this.channel.video.videoId &&
          this.playerStateService.playerIsReady
        ) {
          const { videoId, videoStatus, currentTime } = this.channel.video;
          this.channelVideoStateService.onStateChange(
            videoId,
            videoStatus,
            this.playerStateService.playerIsPlaying,
            currentTime
          );
        }
      });
    this.onYoutubePlayerStateChange();
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
    this.channel.video.currentTime = 0;
    this.channel.video.videoStatus = VideoStatus.CUE;
    this.channelService.setChannel(this.channel);
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
    this.playerReadyWatcher.next(event);
    console.log(event);
  }

  /**
   * Event emitted from youtube component on player state changed
   */
  onYoutubePlayerStateChange() {
    this.youtubePlayerService.playerStateWatcher.subscribe((state) => {
      this.playerStateService.onPlayerStateChange(
        state,
        this.isHost,
        this.channel,
        this.youtubePlayerService.getCurrentTime()
      );
    });
  }

  /**
   * Event emitted from youtube component on player error
   */
  onYoutubePlayerError(event) {
    this.playerStateService.onPlayerError(event, this.channel);
  }

  async ngOnDestroy() {
    if (this.isHost) {
      this.channel.video.videoId = "";
      this.channel.video.videoStatus = VideoStatus.STOP;
      this.channel.video.currentTime = 0;
      this.channelService.setChannel(this.channel);
    }
    await this.channelService.removeChannelUser(this.channel, this.user);
    this.youtubePlayerService.playerStateWatcher.next();
    this.youtubePlayerService.playerStateWatcher.unsubscribe();
    this.channelSubscription.unsubscribe();
  }

  /**
   * Executes on video page initialization, setups controller variables and checks that the channel route is valid
   */
  private initVideoPage(channelUid: string): Observable<any> {
    return from(
      Promise.all([
        this.channelService.getChannelAsPromise(channelUid),
        this.validateRoute(channelUid),
        this.setUser(),
      ])
    ).pipe(
      switchMap(([channel]) => {
        this.setChannel(channel);
        return this.channelService.addChannelUser(this.channel, this.user.uid);
      })
    );
  }

  private async setHostCurrentTime(): Promise<any> {
    try {
      if (this.playerStateService.playerIsPlaying) {
        const currentTime = this.youtubePlayerService.getCurrentTime();
        if (
          (this.channel.video.currentTime || 0) + 2 < currentTime &&
          (this.channel.video.currentTime || 0) - 2 > currentTime
        ) {
          if (this.isHost) {
            this.channel.video.currentTime = this.youtubePlayerService.getCurrentTime();
            this.channelService.setChannel(this.channel);
          }
        }
      }
    } catch (err) {
      console.error(err);
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
      hostIsOnline: hostIsOnline ? true : false,
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
      this.setIsHost(username);
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Evaluates if user is host of current channel
   */
  private setIsHost(username: string): void {
    console.log(
      "IS HOST :",
      `${username}` === this.router.url.substr(1) ? true : false
    );
    this.isHost = `${username}` === this.router.url.substr(1) ? true : false;
  }
}
