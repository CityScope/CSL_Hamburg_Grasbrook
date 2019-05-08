import { Component, OnInit } from '@angular/core';
import { CityioService } from '../service/cityio.service';
import { interval } from 'rxjs';

@Component({
  selector: 'app-radar-chart',
  templateUrl: './radar-chart.component.html',
  styleUrls: ['./radar-chart.component.css']
})
export class RadarChartComponent implements OnInit {

  // a component can have its own clock
  update = interval(1000);

  constructor(private cityio: CityioService) { }

  ngOnInit() {
    this.update.subscribe((n)=>{
      console.log(this.cityio.table_data);
    }); 
  }

}
