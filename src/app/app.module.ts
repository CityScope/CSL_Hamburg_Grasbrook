import { BrowserModule } from "@angular/platform-browser";
import { NgModule, OnInit } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BasemapComponent } from "./basemap/basemap.component";

import { MatIconModule, MatTooltipModule } from '@angular/material';

import { HomeComponent } from "./home/home.component";
import { RadarChartComponent } from "./radar-chart/radar-chart.component";
import { MapSettingComponent } from './basemap/map-controls/map-setting/map-setting.component';
import { LegendComponent } from "./basemap/map-controls/legend/legend.component";
import { LayerControlComponent } from "./basemap/map-controls/layer-control/layer-control.component";
import { ConfigurationService } from "./service/configuration.service";
import { GridLayerService } from "./service/grid-layer.service";

@NgModule({
  declarations: [
    AppComponent,
    BasemapComponent,
    HomeComponent,
    RadarChartComponent,
    MapSettingComponent,
    LegendComponent,
    LayerControlComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatTooltipModule
  ],
  providers: [
    HttpClientModule,
    GridLayerService,
    ConfigurationService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule implements OnInit {
  ngOnInit() {}
}
