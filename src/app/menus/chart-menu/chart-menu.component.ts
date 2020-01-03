import {Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation, Output, EventEmitter} from '@angular/core';
import * as d3 from 'd3';
import d3Tip from "d3-tip"
import {CityIOService} from "../../services/cityio.service";
import {CsLayer} from '../../../typings';


@Component({
    selector: 'app-chart-menu',
    templateUrl: './chart-menu.component.html',
    styleUrls: ['./chart-menu.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ChartMenuComponent implements OnInit {

    @ViewChild('chart', {static: true})
    chartContainer: ElementRef;
    @Input() chartToShow: string;
    private data: Array<any>;
    private gfaData: Array<any>;
    private stormwaterData: Array<any>;
    private margin: any = {top: 20, bottom: 20, left: 80, right: 20};
    private chart: any;
    private width: number;
    private height: number;
    private svg: any;
    private isLoading = false;

    constructor(private cityIoService: CityIOService) {
    }

    ngOnInit() {
        // does not work on switching --> force collapsing?
        console.log('chart to show in chart menu component', this.chartToShow);

        this.gfaData = [
            {"gfa": "Other", "area": 0, "target": 30000},
            {"gfa": "Commercial", "area": 0, "target": 550000},
            {"gfa": "Residential", "area": 0, "target": 300000}
        ];
        this.stormwaterData = [
                {"gfa": "white", "m³": 0, "target": 12},
                {"gfa": "grey", "m³": 0, "target": 15},
                {"gfa": "black", "m³": 0, "target": 20}
            ];

        this.getDataFromCityIO();
        this.setDataForChart();
        this.cityIoService.gridChangeListener.push(this.updateFromCityIO.bind(this));
        this.createChart();
        this.updateChart();
    }

    async updateFromCityIO(field) {
        if(this.cityIoService.checkHashes(false).indexOf(this.chartToShow) >= 0) {
            // kpi_gfa is not up to date
            this.isLoading = true;
        }
        if (field === this.chartToShow) {
            // got new data
            this.getDataFromCityIO();
            this.updateChart();
            this.isLoading = false;
        }
     }

    getDataFromCityIO() {
        let cityIoGFA = this.cityIoService.table_data["kpi_gfa"];
        if (cityIoGFA) {
            this.gfaData = [
                {"gfa": "Other", "area": cityIoGFA['special'], "target": cityIoGFA['special_expected']},
                {"gfa": "Commercial", "area": cityIoGFA['commerce'], "target": cityIoGFA['commerce_expected']},
                {"gfa": "Residential", "area": cityIoGFA['living'], "target": cityIoGFA['living_expected']}
            ];
        }
        let cityIoStormwater = this.cityIoService.table_data["stormwater"];
        if (cityIoStormwater) {
            this.stormwaterData = [
                {"stormwater": "white", "area": cityIoStormwater['white'], "target": 0},
                {"stormwater": "grey", "area": cityIoStormwater['grey'], "target": 0},
            ];

        }
        // return cityIoGFA;
    }

    createChart() {
        let element = this.chartContainer.nativeElement;
        this.width = 300 - this.margin.left - this.margin.right;
        this.height = 200 - this.margin.top - this.margin.bottom;

        this.svg = d3.select(element).append('svg')
            .attr('width', element.offsetWidth)
            .attr('height', element.offsetHeight);
    }

    updateChart() {
        console.log("dings")
        d3.selectAll("svg > *").remove();
        d3.selectAll(".d3-tip").remove();

        // chart plot area
        this.chart = this.svg.append('g')
            .attr('class', 'bars')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        let y = d3.scaleBand()
            .range([this.height, 0])
            .padding(0.1);

        let x = d3.scaleLinear()
            .range([0, this.width]);

        // Tooltip for chart
        let tip = d3Tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "<strong>Current:</strong> <span style='color:black'>" + d.area + "</span> <br />" +
                        "<strong>Target:</strong> <span style='color:red'>" + d.target + "</span>";
            });

        this.svg.call(tip);

        // Scale the range of the data in the domains
        x.domain([0, d3.max(this.data, function (d) {
            return d.area > d.target ? d.area : d.target;
        })]);

        y.domain(this.data.map(function (d) {
            return d.gfa;
        }));

        // append the rectangles for the bar chart
        let eSel = this.svg.selectAll(".bar")
            .data(this.data)
            .enter();

        eSel.append("rect")
            .attr("class", "bar")
            .attr("width", function (d) {
                return x(d.area);
            })
            .attr("y", function (d) {
                return y(d.gfa);
            })
            .attr("height", y.bandwidth())
            .attr("transform", "translate(" + (this.margin.left + 3) + ",0)")
            .on('mouseover', function(d) { tip.show(d, this); })
            .on("mouseout", d => tip.hide(d));

        // add the target lines
        eSel.append("path")
            .style("stroke", "red")
            .style("stroke-width", 1)
            .attr("d", function(d) {
                //TODO: how to access the margins here ...
                const marginLeft = 80 + 3;
                let rv = "M" + (x(d.target) + marginLeft) + "," + y(d.gfa);
                rv += "L" + (x(d.target) + marginLeft) + "," + (y(d.gfa) + y.bandwidth());
                return rv;
            });

        // add the x Axis
        this.svg.append("g")
            .attr('class', 'axis axis-x')
            .attr("transform", "translate(" + this.margin.left + "," + this.height + ")")
            .call(d3.axisBottom(x));

        // add the y Axis
        this.svg.append("g")
            .attr('class', 'axis axis-y')
            .attr("transform", "translate(" + this.margin.left + ",0)")
            .call(d3.axisLeft(y));
    }

    private setDataForChart() {
        if (this.chartToShow === 'kpi_gfa') {
            this.data = this.gfaData;
            return;
        }
        if (this.chartToShow === 'stormwater') {
            this.data = this.stormwaterData;
            return;
        }
        console.log('unknown chart requested:', this.chartToShow);
    }
}
