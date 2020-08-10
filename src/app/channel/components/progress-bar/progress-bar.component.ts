import {
  Component,
  OnInit,
  Input,
  NgZone,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { Subject } from "rxjs";

@Component({
  selector: "app-progress-bar",
  templateUrl: "./progress-bar.component.html",
  styleUrls: ["./progress-bar.component.scss"],
})
export class ProgressBarComponent implements OnInit {
  @ViewChild("videoRange") domRef: any;
  @ViewChild("hovered") hoveredTimeEl: any;
  @Output() videoRangeClick = new EventEmitter<number>();
  @Input() videoDuration: number;
  @Input() videoCurrentTimeWatcher: Subject<number>;
  videoCurrentTime: number;
  hoveredTime: number;
  isHovered: boolean;
  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    this.videoCurrentTimeWatcher.subscribe((time) =>
      this.ngZone.run(() => {
        console.log(time, this.videoDuration), (this.videoCurrentTime = time);
      })
    );
  }

  ngAfterViewInit(): void {
    this.addStyleTagToShadowRoot();
  }

  onVideoRangeClick(e): void {
    this.videoRangeClick.emit(e.target.value);
  }

  onMouseOver(e) {
    this.isHovered = true;
    const xOffset = e.offsetX;
    const width = e.target.clientWidth;
    const percentage = (xOffset * 100) / width;
    const time = (this.videoDuration / 100) * percentage;
    this.hoveredTime = Math.round(time);
    this.hoveredTimeEl.nativeElement.style.left = `${e.offsetX}px`;
  }
  onMouseLeave(e) {
    this.isHovered = false;
  }
  private addStyleTagToShadowRoot(): void {
    const style = document.createElement("style");
    style.innerHTML = ".range-slider { cursor: pointer!important; }";
    // console.log(this.domRef);
    this.domRef.el.shadowRoot.appendChild(style);
  }
}
