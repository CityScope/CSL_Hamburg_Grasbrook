import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import {HomeComponent } from "./home/home.component";
import {RadarChartComponent } from "./radar-chart/radar-chart.component";
import {BasemapComponent } from "./basemap/basemap.component";
import {AuthGuard} from "./utils/auth.guard";
import {LoginComponent} from "./login/login.component";

const routes: Routes = [
  { path: "", component: HomeComponent, canActivate: [AuthGuard]  },
  { path: 'login', component: LoginComponent },
  { path: "radar", component: RadarChartComponent },
  { path: "map", component: BasemapComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
