import {
  Component,
  OnInit,
  Input,
  NgZone,
  Output,
  EventEmitter,
} from "@angular/core";
import { Subject } from "rxjs";

@Component({
  selector: "app-progress-bar",
  templateUrl: "./progress-bar.component.html",
  styleUrls: ["./progress-bar.component.scss"],
})
export class ProgressBarComponent implements OnInit {
  @Output() videoRangeClick = new EventEmitter<number>();
  @Input() videoDuration: number;
  @Input() videoCurrentTimeWatcher: Subject<number>;
  videoCurrentTime: number;
  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    this.videoCurrentTimeWatcher.subscribe((time) =>
      this.ngZone.run(() => {
        console.log(time, this.videoDuration), (this.videoCurrentTime = time);
      })
    );
  }

  onVideoRangeClick(e): void {
    this.videoRangeClick.emit(e.target.value);
  }
}
