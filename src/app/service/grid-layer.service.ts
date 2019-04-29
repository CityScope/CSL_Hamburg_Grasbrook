import { Injectable } from '@angular/core';
import { Observable, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { catchError, tap } from "rxjs/operators";
import {GridLayer} from "../layer/grid.layer";

@Injectable({
  providedIn: "root"
})
export class GridLayerService {

  cityIOData: any;
  //TODO: should this come from cityio?
  DEFAULT_TABLE_NAME: string = "grasbrook";


  constructor(private http: HttpClient,
              private gridLayer: GridLayer) {
  }

  getGridLayer() {
    return this.gridLayer.makeGridFromCityIO(this.cityIOData);
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
    return this.http.get(this.getTableURL()).pipe(
      tap(d => {
        this.cityIOData = d;
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
