import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError, tap } from "rxjs/operators";

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
    return CITYIO_TABLE_URL + DEFAULT_TABLE_NAME;
  }

  getCityIOdata(): Observable<any> {
    return this.http.get(this.cityIOTableURL).pipe(
      tap(cityIOData => {
        console.log("c");

        this.cityIOData = cityIOData;
      }),
      catchError(this.handleError("getMetadata", [])) // Still returns result (empty)
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
