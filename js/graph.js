/**
 * Fonction qui dessine le graphe centré en (0, 0) et s'étendant de
 * [-100, 100] en x et en y.
 */
function molecule_graph(graph, data)
{
	'use strict';


	// resize coeff
	var coeffic = 0.25;
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
		.attr('fill', 'white')
		.attr('stroke', 'black')
	;

	//--------------------------------------

	var group = graph.append('g')
		.attr('transform', 'translate('+transcoeff+','+transcoeff+') scale('+coeffic+')') // Initial translation.
	;

	//--------------------------------------

	var zoomer = d3.behavior.zoom()
		.translate([-100, -100]).scale(coeffic) // Initial translation.
		.on('zoom', function () {
			var e = d3.event;

			// @todo When we are focused on a node.

			group.attr(
				'transform',
				'translate('+ e.translate +') scale('+ e.scale +')'
			);
		})
	;

	graph
		.call(zoomer)
		.on('dblclick.zoom', null)
	;

	graph
		.on('click', previous_view)
		.on('dblclick', reset_view)
	;

	//======================================


	//force propriety
	var charge = -500 ;
	var gravity = 0.1  ;
	var linkdistance = 75 ;

	var TYPE_POOL = 0;
	var TYPE_HOST = 1;
	var TYPE_VM   = 2;

	// Pools to center distance.
	var pool_distance = 100 ;

	// Hosts to pools distance.
	var host_distance = 100 ;

	// VMs to hosts distance.
	var vm_distance = 100 ;

	// Node radius (can be a function).
	var node_radius = 15 ;

	// Node color (can be a function).
	var node_color = function (node) {
		var colors = ['#1f77b4', '#ff7f0e', '#2ca02c'];
		return colors[node.type];
	};

	// Animation duration.
	var duration = 400;

	//--------------------------------------

	// @todo
	var node;
	var link;

	var current_node = null;

	//--------------------------------------

	var force = d3.layout.force()
		.size([200, 200])
		.charge(charge)
		.linkDistance(function (link) {
			return link.distance || linkdistance;
		})
		.gravity(gravity)
		.on('tick', function () {
			node.attr(
				'transform',
				function (d) {
					return "translate("+ d.x +","+ d.y +")";
				}
			);

			link
				.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; })
			;
		})
	;

	update();

	//--------------------------------------

	function update()
	{
		// @todo Find a way to remove “tmp”.
		var tmp = create_nodes_and_links(data);
		var nodes = tmp[0];
		var links = tmp[1];

		// Creates a virtual node at the center.
		!function (nodes, links) {
			var center = {};

			nodes = nodes.slice();
			links = links.slice();

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

		force.start();

		//------------------

		link = group.selectAll('.link').data(links, function (link, i) {
			// @todo
			return i;
		});

		link.enter().append('line')
			.attr('class', 'link')
			.attr('stroke', 'black') // @todo CSS.
		;

		link.exit().remove();

		//------------------

		node = group.selectAll('.node').data(nodes, function (link, i) {
			// @todo
			return i;
		});

		var new_node = node.enter().append('g')
			.attr('class', 'node')
			.on('click', select_node)
			.attr(
				"transform",
				function (d, i) {
					return "translate("+ d.x +","+ d.y +")";
				}
			)
		;

		new_node.append('circle')
			.attr('r', node_radius)
			.attr('fill', node_color)
		;

		// @todo Shift position.
		new_node.append('text')
			.text(function (d) {
				return d.label;
			})
		;

		node.exit().remove();
	}

	//--------------------------------------

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
					'distance': host_distance,
				});

				_.each(host.vms, function (vm) {
					vms.push(vm);

					vm.type = TYPE_VM;

					links.push({
						'source': vm,
						'target': host,
						'distance': vm_distance,
					});
				});
			});
		});

		// Initially places pools, hosts and VMs on concentric
		// circles.

		var mid_h = 100;
		var mid_w = 100;
		var TWO_PI = 2 * Math.PI;

		var alpha = TWO_PI / pools.length;
		var radius = pool_distance;
		_.each(pools, function (pool, i) {
			var alpha_i = alpha * i;
			pool.x = Math.cos(alpha_i) * radius + mid_w;
			pool.y = Math.sin(alpha_i) * radius + mid_h;
		});

		var alpha = TWO_PI / hosts.length;
		var radius = pool_distance + host_distance;
		_.each(hosts, function (host, i) {
			var alpha_i = alpha * i;
			host.x = Math.cos(alpha_i) * radius + mid_w;
			host.y = Math.sin(alpha_i) * radius + mid_h;
		});

		var alpha = TWO_PI / vms.length;
		var radius = pool_distance + host_distance + vm_distance;
		_.each(vms, function (vm, i) {
			var alpha_i = alpha * i;
			vm.x = Math.cos(alpha_i) * radius + mid_w;
			vm.y = Math.sin(alpha_i) * radius + mid_h;
		});

		return [
			pools.concat(hosts, vms),
			links
		];
	}

	//--------------------------------------

	function select_node(d, current_node_i)
	{
		if (current_node === this)
		{
			previous_view();
			return;
		}

		// @todo Mutualize.
		if (current_node)
		{
			d3.select(current_node).classed('selected', false);
		}

		// Marks this node as selected.
		current_node = this;
		d3.select(this).classed('selected', true);

		// @todo Fade any other links and node.
		node.select('circle').transition().duration(duration).style('fill', function (d, i) {
			if (current_node_i === i)
			{
				return null;
			}
			var old = d3.rgb(d3.select(this).attr('fill'));
			var bg = d3.rgb('white');

			return d3.rgb(
				old.r * 0.1 + bg.r * 0.9,
				old.g * 0.1 + bg.g * 0.9,
				old.b * 0.1 + bg.b * 0.9
			).toString();
		});
		link.transition().duration(duration).style('stroke-opacity', 0.1);

		// Zooms on the selected node.
		var scale = 5;
		var x = -d.x * scale;
		var y = -d.y * scale;
		group.transition().duration(duration).attr(
			'transform',
			'translate('+ x +','+ y +') scale('+ scale +')'
		);

		// Prevents the event from being re-catched by “graph”.
		d3.event.stopPropagation();
	}

	//--------------------------------------

	function reset_view()
	{
		// @todo Mutualize.
		if (current_node)
		{
			d3.select(current_node).classed('selected', false);
			current_node = null;

			node.select('circle').transition().duration(duration).style('fill', function() {
				return d3.select(this).attr('fill');
			});
			link.transition().duration(duration).style('stroke-opacity', 1);
		}

		group.transition().duration(duration).attr(
			'transform',
			'translate(-100, -100)'
		);

		zoomer.translate([-100, -100]);
		zoomer.scale(1);
	}

	//--------------------------------------

	function previous_view()
	{
		// @todo Mutualize.
		if (current_node)
		{
			d3.select(current_node).classed('selected', false);
			current_node = null;

			node.select('circle').transition().duration(duration).style('fill', function() {
				return d3.select(this).attr('fill');
			});
			link.transition().duration(duration).style('stroke-opacity', 1);
		}

		group.transition().duration(duration).attr(
			'transform',
			'translate('+ zoomer.translate().join(',') +') scale('+ zoomer.scale() +')'
		);
	}
}


// Création du SVG et instanciation du graphe.
!function () {
	'use strict';

	var width = 1500;
	var height =1000;
	var coeff = 1;

	var svg = d3.select('body').append('svg')
		.attr('width', width)
		.attr('height', height)
	;

	var graph = svg.append('g')
		.attr(
			'transform',
			'translate('+ 100+','+100+') scale('+ coeff+')'
		)
	;

	// Dessine le graphe dans l'élément graph.
	 molecule_graph(graph, data);

	var coeff = 1 ;

	var graph2 = svg.append('g')
		.attr(
			'transform',
			'translate('+ 100+','+ 300+') scale('+ coeff+')'
		)
	;
	pie_graph_HOST_RAM(graph2, data);

		var coeff = 1 ;

	var graph3 = svg.append('g')
		.attr(
			'transform',
			'translate('+ 200*coeff+','+ 500*coeff +') scale('+ coeff+')'
		)
	;
	pie_graph_HOST_RAM(graph3, data);

		var coeff = 1 ;

	var graph4 = svg.append('g')
		.attr(
			'transform',
			'translate('+ 200*coeff+','+ 200*coeff +') scale('+ coeff+')'
		)
	;
	pie_graph_HOST_RAM(graph4, data);

}();
