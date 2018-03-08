import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';

import { Stocks } from './shared/data';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private margin = { top: 20, right: 20, bottom: 30, left: 50 };
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  private div:any;
  private line: d3Shape.Line<[number, number]>;
  private highAlert: number;
  private lowAlert: number;
  isDataAvailable: boolean;

  constructor() {
    this.width = 960 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
    this.highAlert = 5.7;
    this.lowAlert = 5.3;
    this.isDataAvailable = true;
  }

  ngOnInit() {
    this.div = d3.select("body")
            .append("div")  
            .attr("class", "tooltip")        
            .style("opacity", 0); 
    this.initSvg();
    this.initAxis();
    this.drawAxis();
    this.drawLine();
  }

  private initSvg() {
     
    this.svg = d3.select("#visualisation")
                .append("g")
                .attr("width", this.width + this.margin.left + this.margin.right)
                .attr("height", this.height + this.margin.top + this.margin.bottom)
                .attr("id","svg")
                .append("g").attr("transform",
                    "translate(" + this.margin.left + "," + this.margin.top + ")");
    this.svg.append('line')
            .attr('x1', 0)
            .attr('y1', 135)
            .attr('x2', this.width)
            .attr('y2', 135)
            .style('stroke', 'rgb(255, 0, 0)')
            .style('stroke-width', 3);
    this.svg.append('line')
            .attr('x1', 0)
            .attr('y1', 315)
            .attr('x2', this.width)
            .attr('y2', 315)
            .style('stroke', 'rgb(255, 0, 0)')
            .style('stroke-width', 3);
    this.svg.append('circle')
            .attr('cx', 370)
            .attr('cy', 125)
            .attr('r', 20)
            .style('stroke-width', 2)
            .style("fill", "none")
            .style('stroke', 'red');
  }

  private initAxis() {
    this.x = d3Scale.scaleLinear().range([0, this.width]);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    this.x.domain(d3Array.extent(Stocks, (d) => d.scale));
    this.y.domain(d3Array.extent(Stocks, (d) => d.value));
  }

  private drawAxis() {
    this.svg.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', 'translate(0, ' + this.height + ')')
            .call(d3Axis.axisBottom(this.x));

    this.svg.append('g')
            .attr('class', 'axis axis--y')
            .call(d3Axis.axisLeft(this.y))
            .append('text')
            .attr('class', 'axis-title')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text('Value (data)');
  }

  private drawLine() {
    
    this.line = d3Shape.line()
                       .x( (d: any) => this.x(d.scale) )
                       .y( (d: any) => this.y(d.value) );

    this.svg.append('path')
            .datum(Stocks)
            .attr('class', 'line')
            .attr('d', this.line)
            .style("fill", "none")
            .style('stroke-width', 3)
            .style('stroke', 'rgb(0, 0, 255)');
  }

  hideChart(event: any) {
        
    console.log('hide chart');
    
    this.isDataAvailable = false;
    d3.selectAll("svg > *").remove();
  }

  private redraw(){
    d3.select("#svg").remove();
    this.reinitSvg(this.highAlert,this.lowAlert);
    this.initAxis();
    this.drawAxis();
    this.drawLine();
  }

  //var z=d3Array.extent(Stocks, (d) => d.scale);

  private reinitSvg(high, low) {
    high=this.getY(Stocks,high);
    low=this.getY(Stocks,low);
    

    this.svg = d3.select("#visualisation")
                .append("g")
                .attr("width", this.width + this.margin.left + this.margin.right)
                .attr("height", this.height + this.margin.top + this.margin.bottom)
                .attr("id","svg")
                .append("g").attr("transform",
                    "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.svg.append('line')
            .attr('x1', 0)
            .attr('y1', high)
            .attr('x2', this.width)
            .attr('y2', high)
            .style('stroke', 'rgb(255, 0, 0)')
            .style('stroke-width', 3);
    this.svg.append('line')
            .attr('x1', 0)
            .attr('y1', low)
            .attr('x2', this.width)
            .attr('y2', low)
            .style('stroke', 'rgb(255, 0, 0)')
            .style('stroke-width', 3);

    this.drawCircle();
  }

  private getY(valArr,pY){
    var stockArr=[];
    for(var i=0;i<valArr.length;i++)
    {
      stockArr.push(valArr[i].value);
    }
    var cY=this.height*(Math.max.apply(null,stockArr)-pY)/(Math.max.apply(null,stockArr)-Math.min.apply(null,stockArr));
    return cY;
  }

  removePoint(event: any){

    var selPoint=parseFloat((<HTMLInputElement>document.getElementById("selPt")).value);
    Stocks.splice(selPoint, 1);
    for(var i= selPoint-1;i<Stocks.length;i++){
      Stocks[i].scale=Stocks[i].scale-1;
    }  

    this.redraw();
  }

  getAlert(event: any){
    var highAl=parseFloat((<HTMLInputElement>document.getElementById("highAl")).value);
    
    this.highAlert=highAl;
    
    var lowAl=parseFloat((<HTMLInputElement>document.getElementById("lowAl")).value);
    this.lowAlert=lowAl;
    this.redraw();
  }

  addPoint(event: any){
    var addPoint=parseFloat((<HTMLInputElement>document.getElementById("addPt")).value);

    var last=Stocks[Stocks.length-1].scale;

    Stocks.push({scale:last+1,value:addPoint});

    this.redraw();
    
    var stockArr=[];
    for(var i=0;i<Stocks.length;i++)
    {
      stockArr.push(Stocks[i].value);
    }

    this.drawCircle();
  }

  private drawCircle(){

    var vm=this;
    var specialPt=[];
    for(var j=0;j<Stocks.length-1;j++){
      if(Stocks[j].value>this.highAlert || Stocks[j].value<this.lowAlert){
        var cX=this.width*j/(Stocks.length-1);
        var cY=this.getY(Stocks,Stocks[j].value);
        specialPt.push(Stocks[j]);

        this.svg.data(specialPt).append("circle")
            .attr('id',j)                
            .attr("r", 5)    
            .attr("cx", function() { return cX; })     
            .attr("cy", function() { return cY; }) 
            .style('stroke', 'red')
            .on("mouseover", function() {    
                vm.div.transition()    
                    .duration(200)    
                    .style("opacity", .9);    
                vm.div.html(this.id + "<br/>"  + Stocks[this.id].value)  
                    .style("left", (d3.event.pageX) + "px")    
                    .style("top", (d3.event.pageY - 28) + "px");  
                })          
            .on("mouseout", function() {    
                vm.div.transition()    
                    .duration(500)    
                    .style("opacity", 0);  
            });

        this.svg.append('circle')
            .attr('cx', cX)
            .attr('cy', cY)
            .attr('r', 20)
            .style('stroke-width', 2)
            .style("fill", "none")
            .style('stroke', 'red')
            ;
      }
    }
  }

  
}
