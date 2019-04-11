import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError, tap } from "rxjs/operators";

// import {
//   CityioGridMapboxService,
//   demoMapboxLayer
// } from "./cityio-grid-mapbox/cityio-grid-mapbox.service";

import { CityGridThreeService } from "./cityio-grid-three/city-grid-three.service";

@Injectable({
  providedIn: "root"
})
export class CityioService {
  // cityIOgridMaker: any = new CityioGridMapboxService();
  CityGridThreeService: any = new CityGridThreeService();
  cityiodata: JSON;
  cityIOTableURL: string;
  cityIOData: any;
  CITYIO_TABLE_URL: string = "https://cityio.media.mit.edu/api/table/";
  DEFAULT_TABLE_NAME: string = "grasbrook";

  constructor(private http: HttpClient) {
    this.cityIOTableURL = this.getTableURL();
  }

  getTableURL(): string {
    // return 'http://localhost:4200/assets/mock-grid-data.json';
    console.log("using cityIO table: ", this.DEFAULT_TABLE_NAME);
    // demo table for now
    return "./assets/cityIO_demo.json";
    // this.CITYIO_TABLE_URL + this.DEFAULT_TABLE_NAME;
  }

  /**
   * Gets cityIO data from server or fallback local file
   */
  getCityIOdata(): Observable<any> {
    return this.http.get(this.cityIOTableURL).pipe(
      tap(cityIOData => {
        this.cityIOData = cityIOData;
      }),
      catchError(this.handleError("getMetadata"))
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = "operation", result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`, error);
      // Let the app keep running by returning:

      return of(result as T);
    };
  }

  getCityIOatInterval() {
    setInterval(() => {
      // check if this is the first run for grid init
      if (this.cityIOData !== null) {
        console.log("making baseline grid...");
        // pass cityio data to the init grid maker function at service
        // this.cityIOgridMaker.makeGridFromCityIO(this.cityiodata);
        // this.CityGridThreeService.makeGridFromCityIO(this.cityiodata);
        // this.initGrid = 1;
      }
    }, 1000);
  }

  getLayer() {
    return this.CityGridThreeService.makeGridFromCityIO(this.cityIOData);
  }
}
