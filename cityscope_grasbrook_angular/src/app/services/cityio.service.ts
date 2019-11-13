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
  updateUrl = "https://cityio.media.mit.edu/api/table/update/";
  tableName = "grasbrook_test";
  url = `${this.baseUrl}${this.tableName}`;

  table_data: any = null; // can be accessed by other components, this will always be updated
  update: Observable<number>;
  public mapPosition = new rxjs.BehaviorSubject({});

  pending_changes = {}

  constructor(private http: HttpClient) {
    this.update = interval(10000);
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
   * POSTs all changed cells (pendung_changes) to cityIO.
   */
  pushAllChanges() {
    if(Object.keys(this.pending_changes).length == 0) return

    for(var key in this.pending_changes) {
      console.log(key, this.pending_changes[key])
      this.table_data["grid"][key] = this.pending_changes[key];
    }
    
    this.pushCityIOdata("grid", this.table_data["grid"]);
    this.pending_changes = {}
  }

  /**
   * POSTs data to cityIO. CAREFUL - this can overwrite with invalid data!
   * @param field the endpoint to post to. e.g. "grid" or "header"
   * @param data the actual data to put there
   */
  pushCityIOdata(field, data) {
    const postData = data
    const url = this.updateUrl + this.tableName + "/" + field
    console.log("pushing to ",url)
    this.http.post(url, postData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
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
