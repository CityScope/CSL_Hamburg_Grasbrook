import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BasemapComponent } from "./basemap/basemap.component";
import { CityioService } from "./cityio/cityio.service";

@NgModule({
  declarations: [AppComponent, BasemapComponent],
  imports: [BrowserModule, HttpClientModule, AppRoutingModule],
  providers: [HttpClientModule],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private cityIOservice: CityioService) {}
  ngOnInit() {
    this.getCityIOalways();
  }

  getCityIOalways() {
    setInterval(() => {
      this.cityIOservice
        .getCityIOdata()
        .subscribe(cityiodata => console.log(cityiodata));
    }, 1000);
  }
}
