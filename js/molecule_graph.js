/* jshint es5:true */
/* global d3, pie_graph, polygon, _ */

/**
 * Fonction qui dessine le graphe centré en (0, 0) et s'étendant de
 * [-100, 100] en x et en y.
 */
function molecule_graph(graph, data, width)
{
	'use strict';

	//--------------------------------------

	// resize coeff
	var coeffic =0.25; // one on the scale in graph.js
	var transcoeff = -(coeffic  * 100 ); // initial state is -100 / -100 needed to be multiplicate by the coeff

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
			.attr('x', -width/2)
			.attr('y', -100)
			.attr('width', width)
			.attr('height', 200)
	;

	// Background element which allows us to get pointer events.
	/* var area = */graph.append('rect')
		.attr('x', -width/2)
		.attr('y', -100)
		.attr('width', width)
		.attr('height', 200)
		.attr('fill', 'white')
	;

	//-------------------------------------

	var group = graph.append('g')
		.attr('id', 'molecule-graph')
		.attr('transform', 'translate('+transcoeff+','+transcoeff+') scale('+coeffic+')') // Initial translation * by the coeff.
	;

	//--------------------------------------

	var zoomer = d3.behavior.zoom()
		.translate([-100*coeffic, -100*coeffic]).scale(coeffic) // Initial translation.
		.on('zoom', function () {
			var e = d3.event;

			if (-1 !== last_id)
			{
				previous_view();
			}

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

	// last id who take for select
	var last_id = -1 ;

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
	var pool_node;
	var host_node;
	var vm_node;

	var link;

	//--------------------------------------

	var force = d3.layout.force()
		.size([200, 200])
		.charge(charge)
		.linkDistance(function (link) {
			return link.distance || linkdistance;
		})
		.gravity(gravity)
		.on('tick', function () {
			pool_node.attr(
				'transform',
				function (d) {
					return 'translate('+ d.x +','+ d.y +')';
				}
			);
			host_node.attr(
				'transform',
				function (d) {
					return 'translate('+ (d.x)+','+ (d.y) +')';
				}
			);
			vm_node.attr(
				'transform',
				function (d) {
					return 'translate('+ (d.x) +','+ (d.y) +')';
				}
			);

			link
				.attr('x1', function(d) { return d.source.x; })
				.attr('y1', function(d) { return d.source.y; })
				.attr('x2', function(d) { return d.target.x; })
				.attr('y2', function(d) { return d.target.y; })
			;
		})
	;

	update();

	//--------------------------------------

	function update()
	{
		// @todo Find a way to remove “tmp”.
		var tmp = create_nodes_and_links(data);

		var nodes = tmp[0].concat(tmp[1],tmp[2]);

		var links = tmp[3];

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

		node = group.append('g').attr('class', '.node')
		;

		pool_node = node.selectAll('.pool').data(tmp[0],function(d) {
				return d.id;

			})
			.enter()
			.append('g')
			.attr('class', 'pool')
			.on('click', select_node)
			.attr(
				'transform',
				function (d) {
					return 'translate('+ d.x +','+ d.y +')';
				}
			)
		;

		pool_node.append('circle')
			.attr('r', node_radius)
			.attr('fill', node_color)
		;


		// @todo Shift position.
		pool_node.append('text')
			.text(function (d) {
				return d.label;
			})
		;

		node.selectAll('.pool').data(tmp[0],function(d,i) {
				return i;
			}).exit().remove();

		//------------------

		 host_node = node.selectAll('.host').data(tmp[1],function(d){
				return d.id;

			})
			.enter().append('g')
			.attr('class', 'host')
			.on('click', select_node)
		;

		polygon(host_node,4,15).attr('fill', node_color);

		// @todo Shift position.
		host_node.append('text')
			.text(function (d) {
				return d.label;
			})
		;

		node.selectAll('.host').data(tmp[1],function(d,i){
				return i;

		}).exit().remove();

		//------------------


		 vm_node = node.selectAll('.vm').data(tmp[2],function(d){
				return d.id;

			})
			.enter().append('g')
			.attr('class', 'vm')
			.on('click', select_node)

		;

		polygon(vm_node,3,15).attr('fill', node_color);

		// @todo Shift position.
		vm_node.append('text')
			.text(function (d) {
				return d.label;
			})
		;

		node.selectAll('.vm').data(tmp[2],function(d,i){
			return i;
		}).exit().remove();
	}


	//--------------------------------------

	function create_nodes_and_links(pools)
	{
		var links = [];

		var hosts = [];
		var vms   = [];

		var save_id = 0;

		// Finds all nested hosts and VMs, defines their “type”
		// attribute and creates links to their parent.
		_.each(pools, function (pool) {
			pool.type = TYPE_POOL;
			pool.id = save_id ;
			save_id = save_id + 1 ;

			_.each(pool.hosts, function (host,i) {
				hosts.push(host);

				host.type = TYPE_HOST;
				host.id = save_id ;
				save_id = save_id + 1 ;

				links.push({
					'source': host,
					'target': pool,
					'distance': host_distance,
				});

				_.each(host.vms, function (vm,i) {
					vms.push(vm);


					vm.type = TYPE_VM;
					vm.id = save_id ;
					save_id = save_id + 1 ;


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
			pool.fixed = true;  // fixed the position of poom.
		});

		alpha = TWO_PI / hosts.length;
		radius = pool_distance + host_distance;
		_.each(hosts, function (host, i) {
			var alpha_i = alpha * i;
			host.x = Math.cos(alpha_i) * radius + mid_w;
			host.y = Math.sin(alpha_i) * radius + mid_h;
		});

		alpha = TWO_PI / vms.length;
		radius = pool_distance + host_distance + vm_distance;
		_.each(vms, function (vm, i) {
			var alpha_i = alpha * i;
			vm.x = Math.cos(alpha_i) * radius + mid_w;
			vm.y = Math.sin(alpha_i) * radius + mid_h;
		});

		return [
			pools,hosts, vms,
			links
		];
	}

	//--------------------------------------

	function select_node(d)
	{
		/* jshint validthis:true */

		if (d.id === last_id)
		{
			previous_view();
			return;

		}


	//	d3.select(current_node).classed('selected', false);


		// Marks this node as selected.
		last_id = d.id;
		d3.select(this).classed('selected', true);

		// @todo Fade any other links and node.
		pool_node.select('circle').transition().duration(duration).style('fill', function (d) {
			if (last_id === d.id )
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

		host_node.select('path').transition().duration(duration).style('fill', function (d) {
			if (last_id === d.id )
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

		vm_node.select('path').transition().duration(duration).style('fill', function (d) {
			if (last_id === d.id )
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
		var scale = 2*coeffic;
		var x = -d.x * scale;
		var y = -d.y * scale;
		group.transition().duration(duration).attr(
			'transform',
			'translate('+ x +','+ y +') scale('+ scale +')'
		);

		// Prevents the event from being re-catched by “graph”.
		d3.event.stopPropagation();



		//--------------------------------------
		//area where pie where be call

		var coeff = 0.3;

		var graphpie = graph.append('g')
		.attr('class','pie')
		.attr(
				'transform',
				'translate('+ (-width/2+100*coeff) +','+ (-100+100*coeff) +') scale('+coeff+')'
			)
		;

		//call pie graph to ram visualisation.
		pie_graph(graphpie,data);
	}

	//--------------------------------------

	function reset_view()
	{
				last_id = -1;


		d3.selectAll('.pool').classed('selected', false);

		d3.selectAll('.path').classed('selected', false);

		d3.selectAll('.path').classed('selected', false);

		pool_node.select('circle').transition().duration(duration).style('fill', function() {
			return d3.select(this).attr('fill');
		});
		host_node.select('path').transition().duration(duration).style('fill', function() {
			return d3.select(this).attr('fill');
		});
		vm_node.select('path').transition().duration(duration).style('fill', function() {
			return d3.select(this).attr('fill');
		});
		link.transition().duration(duration).style('stroke-opacity', 1);

		group.transition().duration(duration).attr(
			'transform',
			'translate('+transcoeff+','+transcoeff+') scale('+coeffic+')'
		);

		zoomer.translate([-100*coeffic, -100*coeffic]);
		zoomer.scale(coeffic);

		//--------------------------------------
		//delete pie graph
		graph.selectAll('.pie').remove();
	}

	//--------------------------------------

	function previous_view()
	{

		last_id = -1;

		// @todo Mutualize.

		d3.selectAll('.pool').classed('selected', false);

		d3.selectAll('.path').classed('selected', false);

		d3.selectAll('.path').classed('selected', false);

		pool_node.select('circle').transition().duration(duration).style('fill', function() {
			return d3.select(this).attr('fill');
		});
		host_node.select('path').transition().duration(duration).style('fill', function() {
			return d3.select(this).attr('fill');
		});
		vm_node.select('path').transition().duration(duration).style('fill', function() {
			return d3.select(this).attr('fill');
		});
		link.transition().duration(duration).style('stroke-opacity', 1);


		group.transition().duration(duration).attr(
			'transform',
			'translate('+ zoomer.translate().join(',') +') scale('+ zoomer.scale() +')'
		);

		//--------------------------------------
		//delete pie graph
		graph.selectAll('.pie').remove();
	}
}
