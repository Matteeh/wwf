import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { VideoPageRoutingModule } from "./video-routing.module";

import { VideoPage } from "./video.page";
import { SearchBarComponent } from "./components/search-bar/search-bar.component";
import { YoutubeService } from "../services/youtube.service";
import { HttpClientModule } from "@angular/common/http";
import { VideoCardComponent } from "./components/video-card/video-card.component";
import { UserService } from "../services/user.service";
import { YoutubePlayerComponent } from "./components/youtube-player/youtube-player.component";
import { PresenceService } from "../services/presence.service";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VideoPageRoutingModule,
    HttpClientModule,
  ],
  providers: [YoutubeService, UserService, PresenceService],
  declarations: [
    VideoPage,
    SearchBarComponent,
    VideoCardComponent,
    YoutubePlayerComponent,
  ],
})
export class VideoPageModule {}
