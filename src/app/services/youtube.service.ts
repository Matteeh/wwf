import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { YOUTUBE_API_KEY } from "../../helpers/api_keys";

@Injectable({
  providedIn: "root",
})
export class YoutubeService {
  baseUrl: string = "https://www.googleapis.com/youtube/v3/search?key=";
  apiKey: string = YOUTUBE_API_KEY;

  constructor(public http: HttpClient) {}

  /**
   * Lists searched videos from youtube api V3
   * @param keyword Search keyword
   */
  listVideos(keyword): Observable<Object> {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${keyword}&key=${this.apiKey}`;
    return this.http.get(url).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
