import { Component, OnInit } from "@angular/core";
import { CityIOService } from "../service/cityio.service";
import { interval } from "rxjs";

@Component({
  selector: "app-radar-chart",
  templateUrl: "./radar-chart.component.html",
  styleUrls: ["./radar-chart.component.css"]
})
export class RadarChartComponent implements OnInit {
  // a component can have its own clock
  update = interval(1000);
  id: JSON;

  constructor(private cityio: CityIOService) {}

  ngOnInit() {
    this.update.subscribe(n => {
      if (this.cityio.table_data) {
        this.id = this.cityio.table_data.meta.id;
        console.log(this.id);
      }
    });
  }
}
