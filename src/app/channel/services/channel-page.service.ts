import { Injectable } from "@angular/core";
import { Channel, VideoStatus } from "src/app/models/channel.model";
import { Observable, from } from "rxjs";
import { switchMap, tap, catchError, filter, mapTo, map } from "rxjs/operators";
import { ChannelService } from "src/app/services/channel.service";
import { UserService } from "src/app/services/user.service";
import { User } from "src/app/models/user.model";
import { AuthService } from "src/app/services/auth.service";
import { Router } from "@angular/router";
import { YoutubeService } from "src/app/services/youtube.service";

@Injectable({
  providedIn: "root",
})
export class ChannelPageService {
  constructor(
    private channelService: ChannelService,
    private userService: UserService,
    private authService: AuthService,
    private youtubeService: YoutubeService,
    private router: Router
  ) {}

  /**
   * Executes on channel page initialization, setups controller variables
   * and checks that the channel route is valid also adds user to channel
   * @returns Observable<[Channel, isRouteValid, User]>
   */
  onChannelPageInit(channelUid: string): Observable<[User, Channel, boolean]> {
    return from(
      Promise.all([
        this.getUser(),
        this.channelService.getChannelAsPromise(channelUid),
        this.isRouteValid(channelUid),
      ])
    ).pipe(
      tap(([user, channel, isRouteValid]) => {
        if (!isRouteValid) this.router.navigate(["/channel-not-found"]);
        if (!user.uid) this.router.navigate["/sign-in"];
        this.channelService.addChannelUser(channel, user.uid);
      })
    );
  }

  /**
   * Sets the video id locally and in the db
   */
  setVideoId(e: string, channel: Channel) {
    const ch = { ...channel };
    if (ch.video) {
      ch.video.videoId = e;
    } else {
      ch.video = {};
      ch.video.videoId = e;
    }
    ch.video.currentTime = 0;
    ch.video.videoStatus = VideoStatus.CUE;
    this.channelService.setChannel(ch);
  }

  /**
   *
   * Get the channel property
   */
  getChannel({ uid, hostIsOnline, users, status, video }: Channel): Channel {
    return {
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
   * Evaluates if user is host of current channel
   */
  getIsHost(username: string, url: string): boolean {
    return `/${username}` === url ? true : false;
  }

  /**
   * If user not found channel is invalid
   */
  private async isRouteValid(channelUid): Promise<boolean> {
    try {
      const userExist = await this.userService.getUserByUsername(channelUid);
      if (!userExist.length) {
        return false;
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  /**
   * Get the user as a clean new object drops all refrences
   */
  private async getUser(): Promise<User> {
    try {
      const {
        uid,
        username,
        email,
        isReady,
        status,
      }: User = await this.authService.getUser();
      /*if (!uid) {
        // Navigate away if no user
        return this.router.navigate["/sign-in"];
      }*/
      return {
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
}

/*
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
  */
