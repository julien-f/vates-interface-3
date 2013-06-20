!function () {
	'use strict';

	////////////////////////////////////////

	var	w = 1000;
	var	h = 1000;

	var link;
	var node;

	var colors = d3.scale.category10();

	var force = d3.layout.force()
		.on("tick", tick)
		.size([w, h])
	;

	var svg = d3.select("body").append("svg")
		.attr("width", w)
		.attr("height", h)
	;

	var tmp = create_nodes_and_links(data);
	var nodes = tmp[0];
	var links = tmp[1];

	// Creates a new tree layout with the default settings.
	//var links = d3.layout.tree().links(nodes);

	// Adds (hidden) virtual node at the center.
	!function (nodes, links) {
		var center = {};

		nodes = nodes.slice(0);
		links = links.slice(0);

		nodes.push(center);
		_.each(data, function (pool) {
			links.push({
				'source': center,
				'target': pool,
			});
		});


		force
			.links(links)
			.nodes(nodes)
		;
	}(nodes, links);

	force
		// A negative value results in node repulsion, while a
		// positive value results in node attraction.
		.charge(-750)
		.linkDistance(75)
		.gravity(0.1)
	;

	update();

	////////////////////////////////////////

	function update()
	{
		force.start();

		// Updates the links.
		link = svg.selectAll(".link")
			.data(links, function(d, i) {
				return i;
			})
		;

		// Enter any new links.
		link.enter().insert("line", ".link")
			.attr("class", "link")
			.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; })
			.attr('stroke', 'black')
		;

		// Exit any old links.
		link.exit().remove();

		// Update the nodes.
		node = svg.selectAll(".node")
			.data(nodes, function(d, i) {
				return i;
			})
		;

		// Enter any new nodes.
		node.enter().append("circle")
			.attr("class", "node")
			.attr("cx", function(d, i) { return d.x; })
			.attr("cy", function(d) { return d.y; })
			.attr("r", 15)
			.attr('fill', function (d) {
				if (d.hosts)
				{
					return colors(0);
				}
				if (d.vms)
				{
					return colors(1);
				}
				return colors(2);
			})
			.call(force.drag)
		;

		// Exit any old nodes.
		node.exit().remove();
	}

	////////////////////////////////////////

	function tick()
	{
		link
			.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; })
		;

		node
			.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; })
		;
	}

	////////////////////////////////////////

	function create_nodes_and_links(pools)
	{
		var nodes = []; // Copies pools into nodes.
		var links = [];

		_.each(pools, function (pool, i) {
			links.push({
				'source': pool,
				'target': pools[i+1] ? pools[i+1] : pools[0]
			});

			nodes.push(pool);

			_.each(pool.hosts, function (host) {
				nodes.push(host);

				links.push({
					'source': host,
					'target': pool,
				});

				_.each(host.vms, function (vm) {
					nodes.push(vm);

					links.push({
						'source': vm,
						'target': host,
					});
				});
			});
		});

		return [
			nodes,
			links
		];
	}
}();
