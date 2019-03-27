import { Component, OnInit } from "@angular/core";
import { CityioService } from "./cityio.service";

@Component({
  selector: "app-cityio",
  templateUrl: "./cityio.component.html",
  styleUrls: ["./cityio.component.css"]
})
export class CityioComponent implements OnInit {
  constructor(private cityIOservice: CityioService) {}

  ngOnInit() {
    this.getCityIOatInterval();
    this.cityIOservice
      .getCityIOdata()
      .subscribe(cityiodata => console.log(cityiodata));
  }

  getCityIOatInterval() {
    setInterval(() => {
      this.cityIOservice
        .getCityIOdata()
        .subscribe(cityiodata => console.log(cityiodata));
    }, 1000);
  }
}
