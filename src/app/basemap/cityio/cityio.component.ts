import { Component, OnInit } from "@angular/core";
import { CityioService } from "./cityio.service";

@Component({
  selector: "app-cityio",
  templateUrl: "./cityio.component.html",
  styleUrls: ["./cityio.component.css"],
  template: `
    <h3>{{ title }}</h3>
  `
})
export class CityioComponent implements OnInit {
  constructor(private cityIOservice: CityioService) {}
  title = "cityIO status...";
  ngOnInit() {
    this.getCityIOatInterval();
  }

  getCityIOatInterval() {
    setInterval(() => {
      this.cityIOservice.getCityIOdata().subscribe(cityiodata => {
        this.title = "cityIO timestamp " + cityiodata.meta.timestamp;
      });
    }, 1000);
  }
}
