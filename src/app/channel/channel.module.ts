import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { ChannelPageRoutingModule } from "./channel-routing.module";

import { ChannelPage } from "./channel.page";
import { SearchBarComponent } from "./components/search-bar/search-bar.component";
import { YoutubeService } from "../services/youtube.service";
import { HttpClientModule } from "@angular/common/http";
import { VideoCardComponent } from "./components/video-card/video-card.component";
import { UserService } from "../services/user.service";
import { YoutubePlayerComponent } from "./components/youtube-player/youtube-player.component";
import { PresenceService } from "../services/presence.service";
import { YoutubePlayerStateService } from "./services/youtube-player-state.service";
import { ChannelVideoStateService } from "./services/channel-video-state.service";
import { ChannelPageService } from "./services/channel-page.service";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChannelPageRoutingModule,
    HttpClientModule,
  ],
  providers: [
    YoutubeService,
    UserService,
    PresenceService,
    YoutubeService,
    YoutubePlayerStateService,
    ChannelVideoStateService,
    ChannelPageService,
  ],
  declarations: [
    ChannelPage,
    SearchBarComponent,
    VideoCardComponent,
    YoutubePlayerComponent,
  ],
})
export class ChannelPageModule {}
