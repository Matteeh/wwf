import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";

@Component({
  selector: "app-volume-control",
  templateUrl: "./volume-control.component.html",
  styleUrls: ["./volume-control.component.scss"],
})
export class VolumeControlComponent implements OnInit {
  @Output() volumeButtonClick = new EventEmitter<any>();
  @Output() volumeRangeChange = new EventEmitter<number>();
  @Input() volume: number = 0;
  @Input() muted: boolean;
  constructor() {}

  ngOnInit() {}

  onVolumeClick() {
    this.volumeButtonClick.emit();
  }

  onVolumeRangeChange(e) {
    this.volumeRangeChange.emit(e.target.value);
  }
}
