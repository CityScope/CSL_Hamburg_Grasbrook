import { BrowserModule } from "@angular/platform-browser";
import { NgModule, OnInit } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BasemapComponent } from "./basemap/basemap.component";

import { CityioService } from "./basemap/cityio/cityio.service";
import { ModuleDataToMapHandler } from "./basemap/moduleDataToMapHandler/module-data-to-map-handler.service";
import { HomeComponent } from './home/home.component';
import { RadarChartComponent } from './radar-chart/radar-chart.component';

@NgModule({
  declarations: [AppComponent, BasemapComponent, HomeComponent, RadarChartComponent],
  imports: [BrowserModule, HttpClientModule, AppRoutingModule],
  providers: [HttpClientModule, CityioService, ModuleDataToMapHandler],
  bootstrap: [AppComponent]
})
export class AppModule implements OnInit {
  ngOnInit() {}
}
