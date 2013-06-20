!function () {
	'use strict';

	var		w = 1000;
	var		h = 1000;

	var		pool
	var		link;
	var		root;

	var force = d3.layout.force()
	.on("tick", tick)
	.size([w, h]);

	var svg = d3.select("body").append("svg")
	.attr("width", w)
	.attr("height", h);

	root = data ;

	 update();
////////////////////////////////////////////////////////////////////////////////

	function update() {

	var nodes = flatten(root);
	// Creates a new tree layout with the default settings
	var links = d3.layout.tree().links(nodes);

	// Restart the force layout.

	force
		// A negative value results in node repulsion, while a positive value results in node attraction.
		.charge(-420)
	    .nodes(nodes)
	    .size([w, h])
	    .linkDistance(30)
	    .start();

	// Update the links…
	link = svg.selectAll(".link")
	.data(links, function(d) { return d.target.label; });

	// Enter any new links.
	link.enter().insert("line", ".link")
	.attr("class", "link")
	.attr("x1", function(d) { return d.source.x; })
	.attr("y1", function(d) { return d.source.y; })
	.attr("x2", function(d) { return d.target.x; })
	.attr("y2", function(d) { return d.target.y; });

	// Exit any old links.
	link.exit().remove();

	// Update the nodes…
	pool= svg.selectAll(".pool")
	.data(nodes, function(d) {return d.label})

	// Enter any new nodes.
	pool.enter().append('g').append("circle")
	.attr("class", "pool")
	.attr("cx", function(d) { return d.x; })
	.attr("cy", function(d) { return d.y; })
	.attr("r", 25)
	.call(force.drag);

	// Exit any old nodes.
	pool.exit().remove();
	}
////////////////////////////////////////////////////////////////////////////////
	function tick() {

		link.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });

		pool.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; });
	}
////////////////////////////////////////////////////////////////////////////////
	// Returns a list of all nodes under the root.
	function flatten(root) {
		var nodes = [], i = 0;
		function recurse(pool) {
			if (!pool.label) pool.label = ++i;
				nodes.push(pool) ;
		}
		console.log(nodes);
		recurse(root);
		return nodes;
	}
}();
