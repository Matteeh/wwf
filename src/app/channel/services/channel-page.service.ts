import { Injectable } from "@angular/core";
import {
  Channel,
  VideoStatus,
  ChannelVideo,
} from "src/app/models/channel.model";
import { Observable, from } from "rxjs";
import { switchMap, tap, catchError, filter, mapTo, map } from "rxjs/operators";
import { ChannelService } from "src/app/services/channel.service";
import { UserService } from "src/app/services/user.service";
import { User } from "src/app/models/user.model";
import { AuthService } from "src/app/services/auth/auth.service";
import { Router } from "@angular/router";
import { ChannelVideoService } from "src/app/services/channel-video.service";
import { ChannelPageRoutingModule } from "../channel-routing.module";
import { ChannelUsersService } from "src/app/services/channel-users.service";

@Injectable({
  providedIn: "root",
})
export class ChannelPageService {
  constructor(
    private channelService: ChannelService,
    private channelVideoService: ChannelVideoService,
    private channelUserService: ChannelUsersService,
    private userService: UserService,
    private authService: AuthService,
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
        this.channelUserService.updateChannelUser(channel.uid, {
          [user.uid]: true,
        });
      })
    );
  }

  addChannelUser(channelUid: string, userUid: string) {
    this.channelUserService.updateChannelUser(channelUid, { [userUid]: true });
  }

  updateHostVideoTime(channelUid: string, currentTime: number) {
    console.log("I am updating the channel time");
    this.channelVideoService.updateChannelVideoTime(channelUid, currentTime);
  }

  /**
   * Sets the video id locally and in the db
   */
  setVideoId(e: string, uid: string, channelVideo: ChannelVideo) {
    const cv = { ...channelVideo };
    cv.videoId = e;
    cv.currentTime = 0;
    cv.videoStatus = VideoStatus.CUE;
    this.channelVideoService.setChannelVideo(uid, cv);
  }

  /**
   * Get the channel property
   */
  getChannel({ uid, hostIsOnline, status }: Channel): Channel {
    return {
      uid,
      hostIsOnline: hostIsOnline ? true : false,
      status: { ...status } || { status: null, timestamp: null },
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
