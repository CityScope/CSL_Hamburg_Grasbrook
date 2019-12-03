import {Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation} from '@angular/core';
import * as d3 from 'd3';
import d3Tip from "d3-tip"
import {CityIOService} from "../../services/cityio.service";


@Component({
    selector: 'app-chart-menu',
    templateUrl: './chart-menu.component.html',
    styleUrls: ['./chart-menu.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ChartMenuComponent implements OnInit {

    @ViewChild('chart', {static: true})
    chartContainer: ElementRef;
    @Input()
    private data: Array<any>;
    private margin: any = {top: 20, bottom: 20, left: 80, right: 20};
    private chart: any;
    private width: number;
    private height: number;
    private isLoading = false;

    constructor(private cityIoService: CityIOService) {
    }

    ngOnInit() {
        this.data = [
            {"gfa": "Other", "area": 0, "target": 30000},
            {"gfa": "Commercial", "area": 0, "target": 550000},
            {"gfa": "Residential", "area": 0, "target": 300000}
        ];

        this.getDataFromCityIO();
        this.cityIoService.gridChangeListener.push(this.updateFromCityIO.bind(this));
        this.createChart();
    }

    async updateFromCityIO(field) {
        if (field === "grid") {
            //this.isLoading = true
        } else if (field === "kpi_gfa") {
            this.getDataFromCityIO();
            this.createChart();
            //this.isLoading = false;
        }
     }

    getDataFromCityIO() {
        let cityIoGFA = this.cityIoService.table_data["kpi_gfa"];
        if (cityIoGFA) {
            this.data = [
                {"gfa": "Other", "area": cityIoGFA['special'], "target": cityIoGFA['special_expected']},
                {"gfa": "Commercial", "area": cityIoGFA['commerce'], "target":  cityIoGFA['commerce_expected']},
                {"gfa": "Residential", "area": cityIoGFA['living'], "target":  cityIoGFA['living_expected']}
            ]
        }
        return cityIoGFA;
    }

    createChart() {
        let element = this.chartContainer.nativeElement;
        this.width = 300 - this.margin.left - this.margin.right;
        this.height = 200 - this.margin.top - this.margin.bottom;

        d3.select("svg").remove();

        let svg = d3.select(element).append('svg')
            .attr('width', element.offsetWidth)
            .attr('height', element.offsetHeight);

        // chart plot area
        this.chart = svg.append('g')
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

        svg.call(tip);

        // Scale the range of the data in the domains
        x.domain([0, d3.max(this.data, function (d) {
            return d.area > d.target ? d.area : d.target;
        })]);

        y.domain(this.data.map(function (d) {
            return d.gfa;
        }));

        // append the rectangles for the bar chart
        let eSel = svg.selectAll(".bar")
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
        svg.append("g")
            .attr('class', 'axis axis-x')
            .attr("transform", "translate(" + this.margin.left + "," + this.height + ")")
            .call(d3.axisBottom(x));

        // add the y Axis
        svg.append("g")
            .attr('class', 'axis axis-y')
            .attr("transform", "translate(" + this.margin.left + ",0)")
            .call(d3.axisLeft(y));
    }
}