import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { interval, of, Observable } from "rxjs";
import * as rxjs from "rxjs/index";
import { catchError, tap } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class CityIOService {
  baseUrl = "https://cityio.media.mit.edu/api/table/";
  tableName = "grasbrook_test";
  url = `${this.baseUrl}${this.tableName}`;

  table_data: any = {}; // can be accessed by other components, this will always be up to date
  update: Observable<number>;
  public mapPosition = new rxjs.BehaviorSubject({});

  public gridChangeListener = []
  lastHashes = {}

  constructor(private http: HttpClient) {
    this.update = interval(10000);
    this.update.subscribe(() => {
      this.fetchCityIOdata().subscribe();
    });
  }

  /**
   * fetches cityio hashes and fetch data for changed fields
   * @param result - Observable<any> containing cityio table data
   */
  fetchCityIOdata(): Observable<any> {
    return this.http.get(this.url+"/meta/hashes").pipe(
      tap(data => {
        for(let key in data) {
          if(this.lastHashes[key] !== data[key]) {
            // data changed!
            this.updateGrid(key).subscribe() // get data for field that has changed
          }
        }
        this.lastHashes = data // update hashes
      }),
      catchError(this.handleError("getHashes"))
    );
  }

  /**
   * Get CityIO data once
   * @param field the endpoint to fetch data from (e.g. "grid")
   */
  updateGrid(field : string): Observable<any> {
    return this.http.get(this.url+"/"+field).pipe(
      tap(data => {
        this.table_data[field] = data;
        if (field === "grid") this.onGridChange()
      }),
      catchError(this.handleError("getData:"+field))
    );
  }

  onGridChange() {
    if(this.gridChangeListener.length == 0) return
    this.gridChangeListener[0]()
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
