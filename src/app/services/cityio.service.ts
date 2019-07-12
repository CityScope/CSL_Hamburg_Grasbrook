import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { interval, of, Observable } from "rxjs";
import * as rxjs from "rxjs/index";
import { catchError, tap } from "rxjs/operators";
import cityIO_demo from "../../assets/cityIO_demo.json";

@Injectable({
  providedIn: "root"
})
export class CityIOService {
  baseUrl = "https://cityio.media.mit.edu/api/table/";
  tableName = "grasbrook";
  url = `${this.baseUrl}${this.tableName}`;

  table_data: any = null; // can be accessed by other components, this will always be updated
  update: Observable<number>;
  public mapPosition = new rxjs.BehaviorSubject({});

  constructor(private http: HttpClient) {
    this.update = interval(1000);
    this.update.subscribe(() => {
      this.fetchCityIOdata().subscribe();
    });
  }

  /**
   * fetches cityio data once
   * @param result - Observable<any> containing cityio table data
   */
  fetchCityIOdata(): Observable<any> {
    return this.http.get(this.url).pipe(
      tap(data => {
        this.table_data = data;
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
}
