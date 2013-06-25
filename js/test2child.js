!function () {
	'use strict';

	// add translation
	var No;

	var activate; // solve the problem with zoom and move.

	var TYPE_POOL = 0;
	var TYPE_HOST = 1;
	var TYPE_VM   = 2;

	var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0];

	///////////////////////////////////

	var save_translate, save_scale ;

	var r = 200;
	var x = d3.scale.linear().range([0, r]);
    var y = d3.scale.linear().range([0, r]);

	var	w = winDim().w ;
	var	h = winDim().h ;

	var link;
	var node;

	var colors = d3.scale.category10();

	var force = d3.layout.force()
		.on("tick", tick)
		.size([w, h])
	;

	var svg = d3.select("body").append("svg")
		.attr("object_id","svg")
		.attr("width", w)
		.attr("height",h)
        .attr("viewBox", "0 0 " + w + " " + h )
        .attr("pointer-events", "all")
    ;

	///////////////////////////////////

	svg
		.on("dblclick",function () {
			reset_view()
			})
	;
	svg
		.on("click",function () {
			previous_view()
			})
	;

	var graph = svg.append('g');

	var zoom = d3.behavior.zoom();

	svg
		.call(zoom.on("zoom", function () {

			if (activate)
			{
				reset_view();
			}

			graph.attr(
				"transform",
				"translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")"
			);
			save_translate = d3.event.translate ;
			save_scale = d3.event.scale ;
		}))
        .on("dblclick.zoom",null)
	;

	///////////////////////////

	//Force declration

	var tmp = create_nodes_and_links(data);
	var nodes = tmp[0];
	var links = tmp[1];

	// Creates a new tree layout with the default settings.
	//var links = d3.layout.tree().links(nodes);

	// Adds (hidden) virtual node at the center.

		// Reacts to appropriate events.



	!function (nodes, links) {
		var center = {};

		nodes = nodes.slice(0);
		links = links.slice(0);

		nodes.push(center);
		_.each(data, function (pool) {
			links.push({
				'source': center,
				'target': pool,
				'distance': 10,
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
		.charge(-500)
		.linkDistance(function (link) {
			return link.distance || 75;
		})
		.gravity(0.1)
	;


	update();

	////////////////////////////////////////

	function update()
	{

		force.start();

		// Updates the links.
		link = graph.selectAll(".link")
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
		node = graph.selectAll(".node")
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
			.attr("fill", function (d) {
				return colors(d.type);
			})
			.on("click",function(d,i){ clickelem (d,i) })
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

	function clickelem(d,current)
	{
	 	activate = true ;

		if (current == No)
		{
			reset_view();
		}
		else
		{
			var x = (w/2-d.x*6);
			var y = (h/2-d.y*6);

			graph.transition().duration(400).attr(
				"transform",
				"translate("+(x) +","+(y) +") scale(" +6+ ")"
			);

			No = current ;

			node.transition().duration(400).style("fill-opacity",function (d,i) { return i == current ? 1 : 0.1; });
			link.transition().duration(400).style("stroke-opacity",0.1);

			d3.event.stopPropagation();

		}
	}

	function reset_view()
	{
		activate = false ;

		console.log(1);

		graph.transition().duration(400).attr(
			"transform",
			"translate(0, 0) scale(1)"
		);

		node.transition().duration(400).style("fill-opacity",1);
		link.transition().duration(400).style("stroke-opacity",1);

		zoom.translate([0, 0]);
		zoom.scale(1);

		No = 0;
	}

	function previous_view()
	{
		activate = false ;

		console.log(1);

		graph.transition().duration(400).attr(
			"transform",
			"translate(" + save_translate + ") scale(" + save_scale + ")"
		);

		node.transition().duration(400).style("fill-opacity",1);
		link.transition().duration(400).style("stroke-opacity",1);

		No = 0 ;
	}
	////////////////////////////////////////

	/* FONCTION QUI AJUSTE LE SITE AU NAVIGATEUR */
	function winDim() {

		var W,H,
			i = window,
			d = document,
			de = d.documentElement,
			db = d.body;

		if ( i.innerWidth ) { // autres que IE
			W = i.innerWidth;
			H = i.innerHeight;

		} else if ( de.clientWidth ) { // IE8
			W = de.clientWidth;
			H = de.clientHeight;

		}

		else { // IE6
			W = db.clientWidth;
			H = db.clientHeight;
		}

		return {w:W,h:H} ;


		}

	////////////////////////////////////////

	function create_nodes_and_links(pools)
	{
		var links = [];

		var hosts = [];
		var vms   = [];

		// Finds all nested hosts and VMs, defines their “type”
		// attribute and creates links to their parent.
		_.each(pools, function (pool) {
			pool.type = TYPE_POOL;

			_.each(pool.hosts, function (host) {
				hosts.push(host);

				host.type = TYPE_HOST;

				links.push({
					'source': host,
					'target': pool,
				});

				_.each(host.vms, function (vm) {
					vms.push(vm);

					vms.type = TYPE_VM;

					links.push({
						'source': vm,
						'target': host,
					});
				});
			});
		});

		// Initially places pools, hosts and VMs on concentric
		// circles.

		var mid_h = h / 2;
		var mid_w = w / 2;
		var TWO_PI = 2 * Math.PI;

		var alpha = TWO_PI / pools.length;
		_.each(pools, function (pool, i) {
			var alpha_i = alpha * i;
			pool.x = Math.cos(alpha_i) * 100 + mid_w;
			pool.y = Math.sin(alpha_i) * 100 + mid_h;
		});

		var alpha = TWO_PI / hosts.length;
		_.each(hosts, function (host, i) {
			var alpha_i = alpha * i;
			host.x = Math.cos(alpha_i) * 200 + mid_w;
			host.y = Math.sin(alpha_i) * 200 + mid_h;
		});

		var alpha = TWO_PI / vms.length;
		_.each(vms, function (vm, i) {
			var alpha_i = alpha * i;
			vm.x = Math.cos(alpha_i) * 300 + mid_w;
			vm.y = Math.sin(alpha_i) * 300 + mid_h;
		});

		return [
			pools.concat(hosts, vms),
			links
		];
	}
}();
