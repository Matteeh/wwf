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
  userVolume: UserVolume = { volume: 50, muted: false };
  destroyYoutube = false;
  channel: Channel;
  channelVideo: ChannelVideo;
  channelUsers;
  channelUid: string;
  videos: any[] = [];
  unsubscribe: Subject<any> = new Subject<any>();
  videoDuration: number;

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
    private channelPageService: ChannelPageService,
    private userVolumeService: UserVolumeService,
    public playerStateService: YoutubePlayerStateService
  ) {
    this.presence.initPresenceSubscriptions();
  }

  async ionViewDidEnter() {
    // Always create a new watcher on new channel
    this.youtubePlayerService.playerStateWatcher = new Subject();
    this.channelUid = this.route.snapshot.paramMap.get("id");

    console.log("ionViewWillEnter!!!", this.channelUid);

    const user = await this.authService.getUser();
    this.user = { ...user };
    this.setIsHost(user);
    const userVolume = await this.userVolumeService.getUserVolume(user.uid);
    this.setUserVolume(userVolume);
    await this.channelPageService.addChannelUser(this.channelUid, user.uid);
    this.youtubePlayerService.IframeApiInit();
    this.onYoutubePlayerStateChange();
  }

  initWatcherOnIframeReady() {
    this.watchChannelChanges(this.channelUid);
    this.watchChannelVideoChanges(this.channelUid);
    this.watchChannelUsers(this.channelUid);
  }

  watchChannelChanges(uid: string) {
    this.channelService
      .getChannel(uid)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (channel: Channel) => {
          this.channel = this.channelPageService.getChannel(channel);
        },
        (err) => console.error("WATCH CHANNEL CHANGES ERROR", err),
        () => console.warn("WATCH CHANNEL CHANGES HAS COMPLETED")
      );
  }

  watchChannelUsers(uid: string) {
    let counter = 0;
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
          console.log(channelUsers, this.channelUid, counter++);
        },
        (err) => console.error("WATCH CHANNEL USERS ERROR", err),
        () => console.warn("WATCH CHANNEL USERS HAS COMPLETED")
      );
  }

  watchChannelVideoChanges(uid: string) {
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
  setVideoId(e: string) {
    this.channelPageService.setVideoId(e, this.channelUid, this.channelVideo);
  }

  /**
   * Handles the user input from the search-bar component
   */
  handleSearchValue(searchValue: string) {
    this.youtubeService.listVideoItems(searchValue).subscribe((items) => {
      this.videos = items;
      console.log(this.videos, "ITEMS");
    });
  }

  onPlayButtonClick() {
    if (
      !this.playerStateService.playerIsPlaying &&
      this.playerStateService.playerIsReady
    ) {
      this.youtubePlayerService.play();
    } else if (
      this.playerStateService.playerIsPlaying &&
      this.playerStateService.playerIsReady
    ) {
      this.youtubePlayerService.pause();
    }
  }

  onVolumeButtonClick() {
    if (this.userVolume.muted) {
      this.youtubePlayerService.toggleMute(true);
      this.userVolume = { volume: this.userVolume.volume, muted: false };
    } else {
      this.youtubePlayerService.toggleMute(false);
      this.userVolume = { volume: this.userVolume.volume, muted: true };
    }
    this.userVolumeService.updateChannelUser(this.user.uid, this.userVolume);
  }

  onVolumeRangeChange(volume): void {
    this.youtubePlayerService.setVolume(volume);
    this.userVolume.volume = volume;
    this.userVolumeService.updateChannelUser(this.user.uid, this.userVolume);
  }

  onVideoRangeClick(clickedTime: number): void {
    this.youtubePlayerService.seekTo(clickedTime);
  }

  /**
   * Event emitted from youtube component on player state changed
   */
  onYoutubePlayerStateChange() {
    this.youtubePlayerService.playerStateWatcher
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
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
  onYoutubePlayerError(event) {
    this.playerStateService.onPlayerError(
      event,
      this.channelUid,
      this.channelVideo
    );
  }

  async ionViewWillLeave() {
    console.log("ION VIEW WILL LEAVE", this.channelUid);
    this.youtubePlayerService.pause();
    this.youtubePlayerService.destroyPlayer();
    this.youtubePlayerService.player = null;
    this.playerStateService.playerIsReady = false;
    if (this.isHost) {
      this.channelVideo.videoId = "";
      this.channelVideo.videoStatus = VideoStatus.STOP;
      this.channelVideo.currentTime = 0;
      this.channelVideoService.updateChannelVideo(
        this.channelUid,
        this.channelVideo
      );
    }
    this.channelVideo = null;
    this.channelUsers = null;
    this.channel = null;
    await this.channelUserService.removeChannelUser(this.channelUid, {
      [this.user.uid]: true,
    });
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  private setUserVolume(userVolume: UserVolume) {
    console.log("userVolume", userVolume);
    if (userVolume) {
      this.userVolume = { ...userVolume };
    } else {
      this.userVolume = { volume: 50, muted: false };
    }
  }

  private setIsHost(user: User) {
    if (user) {
      this.isHost = this.channelPageService.getIsHost(
        user.username,
        this.router.url
      );
    }
  }
}
