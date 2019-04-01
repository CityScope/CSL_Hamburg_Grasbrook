import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { CityioGridMakerService } from "./cityio-grid-maker/cityio-grid-maker.service";

@Injectable({
  providedIn: "root"
})
export class CityioService {
  initGrid: number = 0;
  cityIOgridMaker: any = new CityioGridMakerService();
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
      // can do retry here
      // retry(3),
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
      if (this.cityIOData !== null && this.initGrid == 0) {
        console.log("making baseline grid...");
        // pass cityio data to the init grid maker function at service
        this.cityIOgridMaker.makeGridFromCityIO(this.cityiodata);
        this.initGrid = 1;
      }
    }, 1000);
  }

  getLayer() {
    return {
      id: "route",
      type: "line",
      source: {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              [
                this.cityIOData.header.spatial.latitude,
                this.cityIOData.header.spatial.longitude
              ],
              [
                this.cityIOData.header.spatial.latitude + 0.01,
                this.cityIOData.header.spatial.longitude + 0.01
              ]
            ]
          }
        }
      },
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": "red",
        "line-width": 20
      }
    };
  }
}
