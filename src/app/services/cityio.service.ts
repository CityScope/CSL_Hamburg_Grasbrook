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

  public last_grid_hash = "abs"
  table_data: any = {}; // can be accessed by other components, this will always be up to date
  update: Observable<number>;
  public mapPosition = new rxjs.BehaviorSubject({});

  pending_changes = {};
  public gridChangeListener = [];
  lastHashes = {};

  constructor(private http: HttpClient) {
    this.updateData('header').subscribe();
    this.updateData('grid', false).subscribe();
    this.http.get(this.url+"/meta/hashes/grid").pipe(
      tap(data => {
        this.lastHashes['grid'] = data; // update grid hash once
      }),
      catchError(this.handleError('getHashes'))
    ).subscribe();

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
            if (key === 'noise_result') {
              // this should be done for all simulation modules, that depend on grid and are used as layers in the front end
              this.updateModuleGridHash(key).subscribe(); // only download state of similation module result, not geodata
            } else {
              this.updateData(key).subscribe(); // get data for field that has changed
            }
          }
        }
        this.lastHashes = data; // update hashes
      }),
      catchError(this.handleError('getHashes'))
    );
  }

  /**
   * Get CityIO data once
   * @param field the endpoint to fetch data from (e.g. "grid")
   */
  updateData(field: string, fireEvent = true): Observable<any> {
    return this.http.get(this.url + '/' + field).pipe(
      tap(data => {
        this.table_data[field] = data;
        if (fireEvent) {
          this.onGridChange(field)
        }
      }),
      catchError(this.handleError('getData:' + field))
    );
  }

  updateModuleGridHash(field : string): Observable<any> {
    return this.http.get(this.url + '/' + field + '/grid_hash').pipe(
      tap(data => {
        this.table_data[field] = {grid_hash: data};
        this.onGridChange(field);
      }),
      catchError(this.handleError('getModuleGridHash:' + field))
    );
  }

  onGridChange(field) {
    if(this.gridChangeListener.length === 0) {
      return;
    }
    for (let changeListener of this.gridChangeListener) {
        changeListener(field)
    }
  }

  /**
   * POSTs all changed cells (pendung_changes) to cityIO.
   */
  pushAllChanges() {
    if(Object.keys(this.pending_changes).length == 0) return;

    for(var key in this.pending_changes) {
      console.log(key, this.pending_changes[key]);
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
    const postData = data;
    const url = this.updateUrl + this.tableName + "/" + field;
    console.log("pushing to ",url);
    this.http.post(url, postData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    );
  }

  /**
   * Checks which simulation outputs are up to date or not and returns their field names as a list
   * @param uptodate if true, return all up to date fields, if false return all outdated fields
   */
  checkHashes(uptodate) {
    let returnfields = [];
    for(let field in this.table_data) {
      if ('grid_hash' in this.table_data[field]) {
        const gridhash = this.lastHashes['grid'];
        const layerGridHash = this.table_data[field]['grid_hash'];
        if ((gridhash === layerGridHash) === uptodate) {
          returnfields.push(field);
        }
      }
    }
    return returnfields;
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
