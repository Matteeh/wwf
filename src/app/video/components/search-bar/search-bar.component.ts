import { Component, OnInit, EventEmitter, Output } from "@angular/core";

@Component({
  selector: "app-search-bar",
  templateUrl: "./search-bar.component.html",
  styleUrls: ["./search-bar.component.scss"],
})
export class SearchBarComponent implements OnInit {
  @Output() searchValue = new EventEmitter<string>();
  constructor() {}

  ngOnInit() {}

  /**
   * Emits the searched string on enter key up
   */
  handleSearchValue(e: any) {
    this.searchValue.emit(e.target.value);
  }
}
