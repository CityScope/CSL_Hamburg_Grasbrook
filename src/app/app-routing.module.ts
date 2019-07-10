import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { HomeComponent } from "./home/home.component";
import { BasemapComponent } from "./basemap/basemap.component";
import { AuthGuard } from "./utils/auth.guard";
import { LoginComponent } from "./login/login.component";

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "login", component: LoginComponent },
  { path: "map", component: BasemapComponent }
];

// Protect access to certain areas like this { path: '', component: HomeComponent, canActivate: [AuthGuard]  },

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
