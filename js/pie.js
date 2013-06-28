function pie_graph_HOST_RAM (graph,data) {
	'use strict';

		var vms = ["10","20","30","40"] // DATA

	//--------------------------------------

	// resize coeff
	var coeffic = 1;
	var transcoeff = - (coeffic  * 100 )

	//--------------------------------------

	graph = graph.append('g')
		.attr('pointer-events', 'all')

		// @todo Not sure it is very clean to use a nested element as
		// a clip path.
		.attr('clip-path', 'url(#molecule-graph-area)')
	;

	//--------------------------------------

	// Clipping element.
	graph.append('defs').append('clipPath')
		.attr('id', 'molecule-graph-area')
		.append('rect')
			.attr('x', -100)
			.attr('y', -100)
			.attr('width', 200)
			.attr('height', 200)
	;

	// Background element which allows us to get pointer events.
	var area = graph.append('rect')
		.attr('x', -100)
		.attr('y', -100)
		.attr('width', 200)
		.attr('height', 200)
		.style("fill-opacity","0.2")
		.attr('fill', 'white')
		.attr('stroke', 'black')
	;

	//--------------------------------------

	var group = graph.append('g')
		.attr('transform','scale('+coeffic+')') // Initial translation.
	;

	//--------------------------------------


	var color = ["blue", "red", "purple", "orange", "green"];


	var arc = d3.svg.arc() //Constructs a new arc generator
    	.outerRadius(100)
    	.innerRadius(50);

    var pie = d3.layout.pie()
    		.startAngle(1.5*Math.PI/2)
    		.endAngle(-1.5*Math.PI/2)
   			.sort(null)
   	 		.value(function(d) { return d});

	var	donuts = group.selectAll(".path").data(pie(vms))
				.enter().append("g")
				.attr("class","arc")
				;

		donuts.append("path")
			.attr("d", arc)
			.style("fill",function (d,i) {return color[i] });


};