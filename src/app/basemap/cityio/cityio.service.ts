import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError, tap, retry } from "rxjs/operators";

const CITYIO_TABLE_URL = "https://cityio.media.mit.edu/api/table/";
const DEFAULT_TABLE_NAME = "grasbrook";

@Injectable({
  providedIn: "root"
})
export class CityioService {
  cityIOTableURL: string;
  cityIOData: any;

  constructor(private http: HttpClient) {
    this.cityIOTableURL = this.getTableURL();
  }

  getTableURL(): string {
    // return 'http://localhost:4200/assets/mock-grid-data.json';
    console.log("using cityIO table: ", DEFAULT_TABLE_NAME);
    // demo table for now
    return "./assets/cityIO_demo.json";
    // CITYIO_TABLE_URL + DEFAULT_TABLE_NAME;
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
   * provides cityIO layer used for mapbox rendering
   * (copied from Alex's prototype)
   */
  getLayer(): object {
    return ({
      id: 'gridDataCells',
      source: 'gridDataCells',
      type: 'fill-extrusion',
      paint: {
        // See the Mapbox Style Specification for details on data expressions.
        // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions
        // Get the fill-extrusion-color from the source 'color' property.
        'fill-extrusion-color': ['get', 'color'],
        // Get fill-extrusion-height from the source 'height' property.
        'fill-extrusion-height': ['get', 'height'],
        // Get fill-extrusion-base from the source 'baseHeight' property.
        'fill-extrusion-base': ['get', 'baseHeight'],
        // Make extrusions slightly opaque for see through indoor walls.
        'fill-extrusion-opacity': 0.8
      }
    });
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
}
