import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { DeckglComponent } from "./deckgl/deckgl.component";

const routes: Routes = [{ path: "", component: DeckglComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
