import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { YoutubeService } from "../services/youtube.service";
import { AuthService } from "../services/auth.service";
import {
  Router,
  ParamMap,
  ActivatedRoute,
  NavigationEnd,
} from "@angular/router";
import { UserService } from "../services/user.service";
import { switchMap, tap, takeUntil } from "rxjs/operators";
import { User } from "../models/user.model";
import { Channel, VideoStatus } from "../models/channel.model";
import { ChannelService } from "../services/channel.service";
import { PresenceService } from "../services/presence.service";
import { Subscription, Observable, from, of, Subject } from "rxjs";
import { YoutubePlayerStateService } from "./services/youtube-player-state.service";
import { ChannelVideoStateService } from "./services/channel-video-state.service";
import { YoutubePlayerService } from "./services/youtube-player.service";
import { ChannelPageService } from "./services/channel-page.service";

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
  selector: "app-channel",
  templateUrl: "./channel.page.html",
  styleUrls: ["./channel.page.scss"],
})
export class ChannelPage implements OnInit, OnDestroy {
  isHost = false;
  user: User = {
    username: null,
    email: null,
    uid: null,
    isReady: null,
    status: { status: null, timestamp: null },
  };
  destroyYoutube = false;
  channel: Channel = nullChannel;
  videos: any[] = [];
  unsubscribe: Subject<null> = new Subject<null>();

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
    private youtubePlayerService: YoutubePlayerService,
    private channelPageService: ChannelPageService
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
            return this.channelPageService.onChannelPageInit(channelUid);
          }
          // Otherwise continue
          return of(null);
        }),
        tap(([user]) => {
          if (user) {
            this.isHost = this.channelPageService.getIsHost(
              user.username,
              this.router.url
            );
            this.user = user;
          }
        }),
        switchMap(() => {
          return this.channelService.getChannel(this.channel.uid);
        }),
        tap((channel) => {
          console.log(
            "CHANNEL",
            channel,
            this.playerStateService.playerIsReady
          );
          this.channel = this.channelPageService.getChannel(channel);
          if (
            this.channel.video.videoId &&
            this.playerStateService.playerIsReady
          ) {
            // return this.setHostCurrentTime();
          }
        }),
        takeUntil(this.unsubscribe)
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
   * Sets the video id in the db
   */
  setVideoId(e: string) {
    this.channelPageService.setVideoId(e, this.channel);
  }

  /**
   * Handles the user input from the search-bar component
   */
  handleSearchValue(searchValue: string) {
    this.youtubeService.listVideoItems(searchValue).subscribe((items) => {
      this.videos = items;
    });
  }

  /**
   * Event emitted from youtube component on player state changed
   */
  onYoutubePlayerStateChange() {
    this.youtubePlayerService.playerStateWatcher
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((state) => {
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
    console.log("NG ON DESTROY CALLED");
    if (this.isHost) {
      this.channel.video.videoId = "";
      this.channel.video.videoStatus = VideoStatus.STOP;
      this.channel.video.currentTime = 0;
      this.channelService.setChannel(this.channel);
    }
    await this.channelService.removeChannelUser(this.channel, this.user);
    this.unsubscribe.next(null);
    this.unsubscribe.complete();
  }

  /*private reInitYoutubePlayer() {
    this.destroyYoutube = true;
    this.changeDetector.detectChanges();
    this.destroyYoutube = false;

    this.youtubePlayerService.destroyPlayer();
    this.youtubePlayerService.player = null;
    this.playerStateService.playerIsReady = false;
    this.youtubePlayerService.IframeApiInit();
  }*/
}
