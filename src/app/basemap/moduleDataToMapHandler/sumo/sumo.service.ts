import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";

// Users can configure where this service gets its mobility data from by
// adding a URL parameter to query string.
// e.g. http://project.url.mit.edu?simAPI=my-api-endpoint.json
// This service expects the API endpoint to contain GeoJSON of points.
const SIM_API_ENDPOINT_PARAM = "simAPI";
const DEFAULT_API_ENDPOINT =
  "https://cityio.media.mit.edu/api/table/grasbrook_sim";

@Injectable({
  providedIn: "root"
})
export class SumoService {
  apiEndpoint: string;
  simulationData: any;

  constructor(private http: HttpClient, private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      if (params[SIM_API_ENDPOINT_PARAM])
        this.apiEndpoint = params[SIM_API_ENDPOINT_PARAM];
      else this.apiEndpoint = DEFAULT_API_ENDPOINT;

      console.log("Using mobility simulation API endpoint:", this.apiEndpoint);
    });
  }

  getSimulationData(): Observable<object> {
    console.log("getting mobility simulation data from", this.apiEndpoint);
    return this.http.get<any>(this.apiEndpoint).pipe(
      map(response => {
        let simDataJSON = JSON.parse(response.objects);
        let coordinates_list = [];

        simDataJSON.forEach(function(t) {
          coordinates_list.push(t[1]);
        });
        return {
          type: "MultiPoint",
          coordinates: coordinates_list
        };
      }),
      catchError(this.handleError("getSimulationData", {})) // Still returns result (empty)
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
      // TODO: send the error to remote logging infrastructure
      console.error(`${operation} failed: ${error.message}`, error); // log to console instead
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
