import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { HomeComponent } from "./home/home.component";
import { BasemapComponent } from "./basemap/basemap.component";
import { BasemapTestComponent } from "./basemap-test/basemap-test.component";
import { AuthGuard } from "./utils/auth.guard";

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "map", component: BasemapComponent, canActivate: [AuthGuard]},
  { path: "maptest", component: BasemapTestComponent}
];

// Protect access to certain areas like this { path: '', component: HomeComponent, canActivate: [AuthGuard]  },

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
