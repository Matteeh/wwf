import { Component } from "@angular/core";
import { YoutubeService } from "../services/youtube.service";
import { AuthService } from "../services/auth/auth.service";
import { Router, ActivatedRoute } from "@angular/router";
import { takeUntil } from "rxjs/operators";
import { User, UserVolume } from "../models/user.model";
import { Channel, VideoStatus, ChannelVideo } from "../models/channel.model";
import { ChannelService } from "../services/channel.service";
import { PresenceService } from "../services/presence.service";
import { Subject } from "rxjs";
import { YoutubePlayerStateService } from "./services/youtube-player-state.service";
import { ChannelVideoStateService } from "./services/channel-video-state.service";
import { YoutubePlayerService } from "./services/youtube-player.service";
import { ChannelPageService } from "./services/channel-page.service";
import { ChannelVideoService } from "../services/channel-video.service";
import { ChannelUsersService } from "../services/channel-users.service";
import { UserVolumeService } from "../services/user-volume.service";

@Component({
  selector: "app-channel",
  templateUrl: "./channel.page.html",
  styleUrls: ["./channel.page.scss"],
})
export class ChannelPage {
  isHost = false;
  user: User;
  userVolume: UserVolume;
  channel: Channel;
  channelVideo: ChannelVideo;
  channelUsers;
  channelUid: string;
  videos: any[] = [];
  unsubscribe: Subject<any> = new Subject<any>();

  constructor(
    private authService: AuthService,
    private youtubeService: YoutubeService,
    private channelService: ChannelService,
    private channelVideoService: ChannelVideoService,
    private channelUserService: ChannelUsersService,
    private route: ActivatedRoute,
    private router: Router,
    private presence: PresenceService,
    private channelVideoStateService: ChannelVideoStateService,
    private youtubePlayerService: YoutubePlayerService,
    private userVolumeService: UserVolumeService,
    private channelPageService: ChannelPageService,
    public playerStateService: YoutubePlayerStateService
  ) {
    this.presence.initPresenceSubscriptions();
  }

  async ionViewWillEnter() {
    this.channelUid = this.route.snapshot.paramMap.get("id");

    this.user = await this.authService.getUser();
    this.isHost = this.evalIsHost(this.user.username, this.router.url);
    this.userVolume = await this.userVolumeService.getUserVolume(this.user.uid);

    await this.channelUserService.updateChannelUser(this.channelUid, {
      [this.user.uid]: true,
    });

    this.youtubePlayerService.IframeApiInit();
    this.onYoutubePlayerStateChange();
  }

  initWatcherOnIframeReady(): void {
    this.watchChannelChanges(this.channelUid);
    this.watchChannelVideoChanges(this.channelUid);
    this.watchChannelUsers(this.channelUid);
  }

  watchChannelChanges(uid: string): void {
    this.channelService
      .getChannel(uid)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (channel: Channel) => {
          this.channel = { ...channel };
        },
        (err) => console.error("WATCH CHANNEL CHANGES ERROR", err),
        () => console.warn("WATCH CHANNEL CHANGES HAS COMPLETED")
      );
  }

  watchChannelUsers(uid: string): void {
    this.channelUserService
      .getChannelUsers(uid)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (channelUsers) => {
          if (this.isHost && this.channelVideo && this.channelVideo.isPlaying) {
            this.channelPageService.updateHostVideoTime(
              this.channelUid,
              this.youtubePlayerService.getCurrentTime()
            );
          }
          console.log(channelUsers, this.channelUid);
        },
        (err) => console.error("WATCH CHANNEL USERS ERROR", err),
        () => console.warn("WATCH CHANNEL USERS HAS COMPLETED")
      );
  }

  watchChannelVideoChanges(uid: string): void {
    this.channelVideoService
      .getChannelVideo(uid)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (video: ChannelVideo) => {
          this.channelVideo = { ...video };
          if (
            this.channelVideo.videoId &&
            this.playerStateService.playerIsReady
          ) {
            this.channelVideoStateService.onStateChange(
              this.channelUid,
              this.channelVideo,
              this.playerStateService.playerIsPlaying,
              this.isHost
            );
          }
          if (
            !this.isHost &&
            this.channelVideo &&
            this.channelVideo.videoId &&
            this.channelVideo.isPlaying &&
            this.channelVideo.currentTime
          ) {
            this.youtubePlayerService.loadVideoById(
              this.channelVideo.videoId,
              this.channelVideo.currentTime
            );
            this.youtubePlayerService.play();
          }
        },
        (err) => console.error("WATCH VIDEO CHANGES ERROR", err),
        () => console.warn("WATCH CHANNEL VIDEO CHANGES HAS COMPLETED")
      );
  }

  /**
   * Sets the video id in the db
   */
  setVideoId(e: string): void {
    this.channelVideoService.setChannelVideo(this.channelUid, {
      videoId: e,
      currentTime: 0,
      videoStatus: VideoStatus.CUE,
    });
  }

  /**
   * Handles the user input from the search-bar component
   */
  handleSearchValue(searchValue: string): void {
    this.youtubeService.listVideoItems(searchValue).subscribe((items) => {
      this.videos = items;
    });
  }

  onPlayButtonClick(): void {
    if (!this.playerStateService.playerIsPlaying) {
      return this.youtubePlayerService.play();
    }
    this.youtubePlayerService.pause();
  }

  onVolumeButtonClick(): void {
    this.youtubePlayerService.toggleMute();
    this.userVolume = { ...this.userVolume, muted: !this.userVolume.muted };
  }

  onVolumeRangeChange(volume: number): void {
    this.youtubePlayerService.setVolume(volume);
    this.userVolume = { ...this.userVolume, volume };
  }

  onVideoRangeClick(clickedTime: number): void {
    this.youtubePlayerService.seekTo(clickedTime);
  }

  /**
   * Event emitted from youtube component on player state changed
   */
  onYoutubePlayerStateChange(): void {
    this.youtubePlayerService.playerStateWatcher.subscribe(
      (state) => {
        if (state === "READY") {
          this.initWatcherOnIframeReady();
        }
        this.playerStateService.onPlayerStateChange(
          state,
          this.channelUid,
          this.isHost,
          this.channelVideo,
          this.youtubePlayerService.getCurrentTime()
        );
      },
      (err) => console.error("YOUTUBE PLAYER STATE WATCHER ERROR", err),
      () => console.warn("YOUTUBE PLAYER STATE WATCHER HAS COMPLETED")
    );
  }

  /**
   * Event emitted from youtube component on player error
   */
  onYoutubePlayerError(event): void {
    this.playerStateService.onPlayerError(
      event,
      this.channelUid,
      this.channelVideo
    );
  }

  async ionViewWillLeave() {
    console.log("ION VIEW WILL LEAVE", this.channelUid);
    this.userVolumeService.updateChannelUser(this.user.uid, this.userVolume);
    this.playerCleanUpOnLeave();
    this.playerStateService.playerIsReady = false;
    if (this.isHost) {
      this.hostCleanUpOnLeave();
    }
    await this.channelUserService.removeChannelUser(this.channelUid, {
      [this.user.uid]: true,
    });
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  /**
   * Evaluates if user is host of current channel
   */
  private evalIsHost(username: string, url: string): boolean {
    return `/${username}` === url ? true : false;
  }

  private playerCleanUpOnLeave() {
    this.youtubePlayerService.pause();
    this.youtubePlayerService.destroyPlayer();
    this.youtubePlayerService.player = null;
  }

  private hostCleanUpOnLeave() {
    this.youtubePlayerService.playerStateWatcher.next("ENDED");
    this.channelVideo.videoId = "";
    this.channelVideo.videoStatus = VideoStatus.STOP;
    this.channelVideo.currentTime = 0;

    this.channelVideoService.updateChannelVideo(
      this.channelUid,
      this.channelVideo
    );
  }
}
