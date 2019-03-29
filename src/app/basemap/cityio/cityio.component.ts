import { Component, OnInit } from "@angular/core";
import { CityioService } from "./cityio.service";
import { CityioGridMakerService } from "./cityio-grid-maker/cityio-grid-maker.service";

@Component({
  selector: "app-cityio",
  templateUrl: "./cityio.component.html",
  styleUrls: ["./cityio.component.css"],
  template: `
    <h3>{{ title }}</h3>
  `
})
export class CityioComponent implements OnInit {
  // flag for first init of grid
  initGrid: number = 0;
  cityIOgridMaker: any = new CityioGridMakerService();
  cityiodata: JSON;

  constructor(private cityIOservice: CityioService) {}
  title = "cityIO status...";
  ngOnInit() {
    this.getCityIOatInterval();
  }

  getCityIOatInterval() {
    setInterval(() => {
      this.cityIOservice.getCityIOdata().subscribe(cityiodata => {
        this.cityiodata = cityiodata;
        this.title = "cityIO timestamp " + cityiodata.meta.timestamp;
        // check if this is the first run for grid init
        if (this.cityiodata !== null && this.initGrid == 0) {
          console.log("making baseline grid...");
          // pass cityio data to the init grid maker function at service
          this.cityIOgridMaker.makeGridFromCityIO(this.cityiodata);
          this.initGrid = 1;
        }
      });
    }, 1000);
  }
}
