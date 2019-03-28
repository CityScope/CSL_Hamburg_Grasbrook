import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BasemapComponent } from "./basemap/basemap.component";
import { CityioComponent } from "./basemap/cityio/cityio.component";

@NgModule({
  declarations: [AppComponent, BasemapComponent, CityioComponent],
  imports: [BrowserModule, HttpClientModule, AppRoutingModule],
  providers: [HttpClientModule],
  bootstrap: [AppComponent]
})
export class AppModule {
  ngOnInit() {}
}
