function pie_graph(graph,data) {
	'use strict';

	// DATA
	var vms = [
		{"label" : "VM 1","RAM" : "5"},
		{"label" : "VM 2","RAM" : "5"},
		{"label" : "VM 3","RAM" : "10"},
		{"label" : "VM 1","RAM" : "5"},
		{"label" : "VM 2","RAM" : "5"},
		{"label" : "VM 3","RAM" : "10"},
		{"label" : "VM 4","RAM" : "10"}
		]
	//--------------------------------------

	var color = d3.scale.category20();

	//--------------------------------------

	// Background element which allows us to get pointer events.
	var area = graph.append('rect')
		.attr('x', -100)
		.attr('y', -100)
		.attr('width', 200)
		.attr('height', 200)
		.attr('fill', 'white')
		.attr('stroke', 'black')
	;

	//--------------------------------------

	var group = graph.append('g')
	;

	//--------------------------------------

	var arc = d3.svg.arc() //Constructs a new arc generator
    	.outerRadius(90)
    	.innerRadius(50)
    ;

    var pie = d3.layout.pie()
		.startAngle(0)
		.endAngle(-Math.PI)
		.sort(null)
		.value(function(d) { return d.RAM})
	;

	var	donuts = group.selectAll(".path").data(pie(vms))
		.enter().append("g")
		.attr("class","arc")
	;

	donuts.append("path")
		.attr("d", arc)
		.style("fill",function (d,i) {return color(i) })
	;


	donuts
		.append("text")
		.attr("transform", function(d,i) { return "translate(" + arc.centroid(d) + ")"; })
		.style("font-size","0.7em")
		.attr("dx", -12)
		.text(function (d,i) {return vms[i].RAM +"%" })
	;

	//--------------------------------------

	function legend(i)
	{
		return [40, (-50+(100/vms.length) * i ) ] ;
	}

	//--------------------------------------

    var rect = group.selectAll(".legend")
    	.data(vms)
		.enter().append("g")
		.attr("class","legend")
		.attr('transform', function (pool, i) {
			return ('translate('+ legend(i).join(',') +')');
		})
		;

	rect
		.append("rect")
		.attr('width', 10)
		.attr('height', 10)
		.style("fill",function (d,i) {return color(i) })
		.attr('stroke', 'black')
		.attr('stroke-width',0.2)
	;

	rect
		.append("text")
		.attr("dx",12)
		.attr("dy",6)
		.style("font-size","0.7em")
		.style("dominant-baseline","middle")

		.text(function(d) { return d.label; })
	;

};