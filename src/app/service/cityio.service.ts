import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { interval } from 'rxjs';
import * as rxjs from "rxjs/index";

@Injectable({
  providedIn: 'root'
})
export class CityioService {

  baseUrl = "https://cityio.media.mit.edu/api/table/";
  tableName = "virtual_table";
  url = `${this.baseUrl}${this.tableName}`;

  table_data: any = null; // can be accessed by other components, this will always be updated

  update = interval(1000); // this is just rsjs way of a interval

  public mapPosition = new rxjs.BehaviorSubject({});

  constructor(private http: HttpClient) {
    this.update.subscribe((n)=>{
      this.http.get(this.url).subscribe((data)=> this.table_data = data);
    })
  }
}
