import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map, take, filter, mergeMap, toArray } from "rxjs/operators";
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
  listVideoItems(keyword): Observable<any> {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${keyword}&key=${this.apiKey}`;
    return this.http.get(url).pipe(
      take(1),
      map(({ items }: any) => items),
      mergeMap((items) => items),
      filter(
        (item: any) => item.id !== undefined && item.id.videoId !== undefined
      ),
      toArray()
    );
  }
}
