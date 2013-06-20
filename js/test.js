var w = 1000,
    h = 1000;

// Create the graph.
var svg = d3.select('body').append('svg')
	.attr('height', h)
	.attr('width', w)
	;


var force = d3.layout.force()
	// A negative value results in node repulsion, while a positive value results in node attraction.
	.charge(-420)
    .nodes(data)
    .size([w, h])
    .linkDistance(30)
    .start();

var pools = svg.selectAll('g.pool')
			.data(data)
		;

var pool = pools.enter().append('g').append("circle")
    .attr("class", ".pool")
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .attr("r", 25)
    .style("fill", 'green')
    .style("stroke", 'gray')
    .call(force.drag);

var hosts = pools.selectAll('g.host').data(function (pool) {
				return pool.hosts;
			},
			function (host) {
				return host.label;
			}
		);
;

var host = pools.enter().append('g').append("circle")
    .attr("class", ".hosts")
    .attr("cx", function(d) { return d.x; })
	.attr("cy", function(d) { return d.y; })
    .attr("r", 15)
    .style("fill", 'blue')
    .style("stroke", 'gray')
    .call(force.drag);


svg.style("opacity", 1e-6)
	.transition()
    .duration(1000)
    .style("opacity", 1);

force.on("tick", function(e) {

	pool.attr("cx", function(d) { return d.x; })
	    .attr("cy", function(d) { return d.y; });

	host.attr("cx", function(d) { return d.x; })
	    .attr("cy", function(d) { return d.y; });
});
