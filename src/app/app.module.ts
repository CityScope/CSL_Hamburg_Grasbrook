import {BrowserModule} from "@angular/platform-browser";
import {NgModule, OnInit} from "@angular/core";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {AppRoutingModule} from "./app-routing.module";
import {AppComponent} from "./app.component";
import {BasemapComponent} from "./basemap/basemap.component";
import {
  MatButtonModule,
  MatDialogModule,
  MatIconModule,
  MatSliderModule,
  MatSnackBarModule,
  MatTooltipModule
} from "@angular/material";
import {EditMenuComponent } from './menus/edit-menu/edit-menu.component';
import {HomeComponent} from "./home/home.component";
import {MapSettingComponent} from "./basemap/map-controls/map-setting/map-setting.component";
import {LegendComponent} from "./basemap/map-controls/legend/legend.component";
import {LayerControlComponent} from "./basemap/map-controls/layer-control/layer-control.component";
import {ConfigurationService} from "./services/configuration.service";
import {CityIOService} from "./services/cityio.service";
import {LoginComponent} from "./login/login.component";
import {fakeBackendProvider} from "./interceptors/fake-backend";
import {JwtInterceptor} from "./interceptors/jwt.interceptor";
import {ReactiveFormsModule, FormsModule } from "@angular/forms";
import {ErrorInterceptor} from "./interceptors/error.interceptor";
import {ExitEditorDialog} from "./dialogues/exit-editor-dialog";

@NgModule({
  declarations: [
    AppComponent,
    BasemapComponent,
    HomeComponent,
    MapSettingComponent,
    LegendComponent,
    LayerControlComponent,
    LoginComponent,
    ExitEditorDialog,
    EditMenuComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatButtonModule,
    MatSliderModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [MatSnackBarModule],
  providers: [
    HttpClientModule,
    CityIOService,
    ConfigurationService,

    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},

    // provider used to create fake backend
    fakeBackendProvider
  ],
  entryComponents: [ExitEditorDialog],
  bootstrap: [AppComponent]
})
export class AppModule implements OnInit {
  ngOnInit() {
  }
}
