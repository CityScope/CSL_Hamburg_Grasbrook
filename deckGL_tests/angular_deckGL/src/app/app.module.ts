import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { DeckglComponent } from "./deckgl/deckgl.component";
import { AppRoutingModule } from ".//app-routing.module";

@NgModule({
  declarations: [AppComponent, DeckglComponent],
  imports: [BrowserModule, AppRoutingModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
