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

export class ChartMenuComponent implements OnInit, OnChanges {

    constructor(private cityIoService: CityIOService) {
    }

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

    ngOnChanges() {
        this.updateChart();
    }

    ngOnInit() {
        // does not work on switching --> force collapsing?
        console.log('chart to show in chart menu component', this.chartToShow);

        this.gfaData = [
            {"gfa": "Other", "value": 0, "target": 30000},
            {"gfa": "Commercial", "value": 0, "target": 550000},
            {"gfa": "Residential", "value": 0, "target": 300000}
        ];
        this.stormwaterData = [
            {"stormwater": "white", "value": 0},
            {"stormwater": "grey", "value": 0},
        ];

        this.getDataFromCityIO();
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
                {"subresult": "Other", "value": cityIoGFA['special'], "target": cityIoGFA['special_expected']},
                {"subresult": "Commercial", "value": cityIoGFA['commerce'], "target": cityIoGFA['commerce_expected']},
                {"subresult": "Residential", "value": cityIoGFA['living'], "target": cityIoGFA['living_expected']}
            ];
        }
        let cityIoStormwater = this.cityIoService.table_data["stormwater"];
        if (cityIoStormwater) {
            this.stormwaterData = [
                {"subresult": "white", "value": cityIoStormwater['white']},
                {"subresult": "grey", "value": cityIoStormwater['grey']},
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
        this.setDataForChart()
        d3.selectAll("svg > *").remove();
        d3.selectAll(".d3-tip").remove();

        if (this.svg) {

            // chart plot value
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
                    let text = "<strong>Current:</strong> <span style='color:black'>" + d.value + "</span> <br />";
                    if (d.target) {
                        text = text + "<strong>Target:</strong> <span style='color:red'>" + d.target + "</span>";
                    }
                    return text;
                });

            this.svg.call(tip);

            // Scale the range of the data in the domains
            x.domain([0, d3.max(this.data, function(d) {
                if (!d.target) {
                    return d.value;
                }
                return d.value > d.target ? d.value : d.target;
            })]);

            y.domain(this.data.map(function(d) {
                console.log("hier");
                console.log(d);
                return d.subresult;
            }));

            // append the rectangles for the bar chart
            let eSel = this.svg.selectAll(".bar")
                .data(this.data)
                .enter();

            eSel.append("rect")
                .attr("class", "bar")
                .attr("width", function(d) {
                    return x(d.value);
                })
                .attr("y", function(d) {
                    return y(d.subresult);
                })
                .attr("height", y.bandwidth())
                .attr("transform", "translate(" + (this.margin.left + 3) + ",0)")
                .on('mouseover', function(d) {
                    tip.show(d, this);
                })
                .on("mouseout", d => tip.hide(d));

            // add the target lines
            eSel.append("path")
                .style("stroke", "red")
                .style("stroke-width", 1)
                .attr("d", function(d) {
                    //TODO: how to access the margins here ...
                    const marginLeft = 80 + 3;
                    let rv = "M" + (x(d.target) + marginLeft) + "," + y(d.subresult);
                    rv += "L" + (x(d.target) + marginLeft) + "," + (y(d.subresult) + y.bandwidth());
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
