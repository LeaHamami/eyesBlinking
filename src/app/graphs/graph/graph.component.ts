import { Component, OnInit, Input } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Label } from 'ng2-charts';
import { IblinkPoint } from 'src/app/iblink-point';
import { OpenWebService } from 'src/app/blinking/open-web.service';
import * as CanvasJS from 'canvasjs';
//var CanvasJS = require('./canvasjs.min');

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit {
  public barChartOptions: ChartOptions = {
    responsive: true,
    // We use these empty structures as placeholders for dynamic theming.
    scales: { xAxes: [{}], yAxes: [{}] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };
  public barChartType: ChartType = 'bar';
  public chartColors: Array<any> = [
    {
      backgroundColor: 'rgb(77, 0, 77, 1)',
      borderColor: 'rgba(77, 0, 77, 1)',
      borderWidth: 2,
    }
  ];

  public barChartData: ChartDataSets[];
  public barChartLabels: Label[];

  @Input() blinks: IblinkPoint[];
  constructor(private openWebService: OpenWebService) { }

  ngOnInit() {
    let arrBlinks = this.openWebService.getBlinkData();
    let startDateArry: any[] = [];
    let endDateArry: any[] = [];
    let blinkArry: any[] = [];
    arrBlinks.forEach(element => {
    blinkArry.push(element.blinkCounter).toString;
    startDateArry.push(element.startDate.getMinutes().toString());
   // console.log(startDateArry);
    // endDateArry.push(element.endDate.getHours());
    });
    this.barChartLabels = startDateArry;
    this.barChartData = [{ data: blinkArry, label: 'blinks'}];
  //  console.log(this.barChartData);
  //  console.log(this.barChartLabels);
  }

}
