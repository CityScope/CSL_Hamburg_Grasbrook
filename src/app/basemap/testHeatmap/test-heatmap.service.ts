import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError, tap } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class TestHeatmapService {
  MODULE_API_URL: string =
    "https://cityio.media.mit.edu/api/table/interaction_Heatmap_Module";
  moduleData: any;
  responseData: JSON;

  constructor(private http: HttpClient) {
    this.MODULE_API_URL = this.getModuleURL();
  }

  getModuleURL(): string {
    console.log("module URL: ", this.MODULE_API_URL);
    return this.MODULE_API_URL;
  }

  getModuleData() {
    this.http.get(this.MODULE_API_URL).subscribe(responseData => {
      this.moduleData = responseData;
    }, catchError(this.handleError("getMetadata")));
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

  getModuleatInterval() {
    setInterval(() => {
      console.log(this.moduleData);
      return this.getModuleData();
    }, 1000);
  }

  getLayer() {
    this.getModuleatInterval();
    // return {
    //   id: "MultiPoint",
    //   source: {
    //     type: "geojson",
    //     data: {
    //       type: "MultiPoint",
    //       coordinates: (function() {
    //         let coordinates_list = [];
    //         this.moduleData.objects.cityscopy.forEach(function(t: number) {
    //           coordinates_list.push([t, t]);
    //         });
    //         console.log(coordinates_list);
    //         return coordinates_list;
    //       })()
    //     }
    //   },
    //   type: "heatmap",
    //   paint: {
    //     "heatmap-radius": 100000
    //   }
    // };
  }
}
