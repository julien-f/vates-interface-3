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

	var caption;
	// resize coeff
	var coeffic = 0.1   ; // one on the scale in graph.js
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

	var loading = graph.append("text")
		.attr('x', 0)
		.attr('y', 0)
	    .attr('dy', '.35em')
	    .attr("text-anchor", "middle")
	    .text("simulating. one moment please…")
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

	var selcaption;
	//caption if selected or not
	var selected_caption = false;


	// last id who take for select
	var last_id = -2 ;

	//force propriety
	var charge = function (d) { return d.mass*d.mass * -20 ;   };
	var gravity = 0.5  ;
	var default_distance = 75 ;

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
	var node_radius = function (d) { return d.mass*1.5;   }; ;

	// Node color (can be a function).
	var node_color = function (node) {
		if (node.type == 0 ){
			var green = Math.ceil(255-node.ram/100 * 200) ;
			return 'rgb(00,'+green+',200)' ;  // 0%-25% = 1, .... 75%-100% = 4
		}
		else if (node.type == 1){
			var green = Math.ceil(255-node.ram/100 * 200);
			return 'rgb(200,'+green+',00)' ;  // 0%-25% = 1, .... 75%-100% = 4
		}
		else {
			var blue = Math.ceil(255-node.ram/100 * 200) ;
			return 'rgb(00,200,'+blue+')' ;  // 0%-25% = 1, .... 75%-100% = 4
		 }
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
			return link.distance || default_distance;
		})
		.gravity(gravity)
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
			center.mass = 20;
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

		setTimeout(function() {

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

			pool_node = group.selectAll('.pool').data(tmp[0],function(d) {
				return d.id;
			});



			pool_node
				.enter()
				.append('g')
				.attr('class', 'pool node')
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
			pool_node
				.append('text')
				.text(function (d) {
					return d.label;
				})
			;

			pool_node.exit().remove();

			//------------------
			host_node = group.selectAll('.host').data(tmp[1],function(d){
					return d.id;
				})
			;

			var new_host = host_node
				.enter()
				.append('g')
				.attr('class', 'host node')
				.on('click', select_node)
			;

			var alpha = 0;
			polygon(new_host, 4,node_radius,alpha).attr('fill', node_color);

			// @todo Shift position.
			host_node.append('text')
				.text(function (d) {
					return d.label;
				})
			;

			host_node.exit().remove();

			//------------------
			 vm_node = group.selectAll('.vm').data(tmp[2],function(d){
					return d.id;
				})
			;

			var new_vm = vm_node
				.enter().append('g')
				.attr('class', 'vm node')
				.on('click', select_node)
			;

			var alpha = Math.PI / 3;
			polygon(new_vm,3,node_radius,alpha).attr('fill', node_color);

			// @todo Shift position.
			vm_node.append('text')
				.text(function (d) {
					return d.label;
				})
			;

			vm_node.exit().remove();

			//-------------------
			// Caption

			caption = graph.append('g').attr('class', 'caption');

			caption.on('click', caption_node);

			alpha = Math.PI / 4;

			polygon(caption,4,10,alpha).attr('fill','white').attr('stroke', 'black').attr('stroke-width',1);

			polygon(caption,4,5,alpha).attr('fill','white').attr('stroke', 'black').attr('stroke-width',1);

			caption.attr(
						'transform',
						'translate ('+ (width/2-2.5) +','+ (100-2.5) +') scale('+coeffic+')')
			;

			var n = 100;
			force.start();
			for (var i = n * n; i > 0; --i)
			{
				force.tick();
			}
			force.stop();
			tick ();
			loading.remove();

		}, 100);
	}
		//--------------------------------------

	function select_node(d)
	{
		/* jshint validthis:true */

		if (d.id==last_id)
		{
			previous_view();
			return;
		}
		if (d.id != -1)
		{

		}
		// Marks this node as selected.

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

		if (d.type == 0)
		{
			var coeff = 0.5;
			var graphpie = graph.append('g')
			.attr('class','pie')
			.attr(
					'transform',
					'translate('+ (-width/2+100*coeff) +','+ (-100+100*coeff) +') scale('+coeff+')'
				)
			;
			//call pie graph to ram visualisation.
			pie_2_graph(graphpie,data);
		}
		else if (d.type == 1)
		{
			var coeff = 0.5;
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

		last_id = d.id;

	}

	//--------------------------------------

	function reset_view()
	{
		last_id = -1;

		d3.selectAll('.pool').classed('selected', false);

		d3.selectAll('.host').classed('selected', false);

		d3.selectAll('.vm').classed('selected', false);

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

		d3.selectAll('.host').classed('selected', false);

		d3.selectAll('.vm').classed('selected', false);

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

	//--------------------------------------
	function caption_node ()
	{

		if ( selected_caption == false )
		{
			var margin = 25;
			selcaption = caption.append('g');
			selcaption.append('rect')
				.attr('x',-150)
				.attr('y',-200)
				.attr('width',150)
				.attr('height',200)
				.attr('fill','white')
				.attr('stroke', 'black')
				.attr('stroke-width',(1))
			;

			//--------------------------------------
			var pool_caption = selcaption.append('g')
				.attr(
					'transform',
					'translate('+(-150+margin+node_radius/2)+','+(-200*1/4)+')'
				)
			;

			pool_caption.append('circle')
				.attr('r',node_radius)
				.attr('fill','#1f77b4')
			;

			pool_caption.append('text').attr('dx',50).attr('dy',4).text('POOL');

			//--------------------------------------
			var alpha = Math.PI / 4;

			var host_caption = selcaption.append('g')
				.attr(
					'transform',
					'translate('+(-150+15/2+margin)+','+(-200*2/4+15/2)+')'
				)
			;
			polygon(host_caption,4,15,alpha)
				.attr('fill', '#ff7f0e')
			;

			host_caption.append('text').attr('dx',50).attr('dy',4).text('HOST');

			//--------------------------------------
			var alpha = Math.PI / 3;

			var vm_caption = selcaption.append('g')
				.attr(
					'transform',
					'translate('+(-150+15/2+margin)+','+(-200*3/4)+')'
				)
			;
			polygon(vm_caption,3,15,alpha).attr('fill', '#2ca02c');

			vm_caption.append('text').attr('dx',50).attr('dy',4).text('VMS');


			selected_caption=true;

		}

		else
		{
			selected_caption=false ;

			selcaption.selectAll('rect').remove();

			selcaption.selectAll('circle').remove();

			selcaption.selectAll('path').remove();

			selcaption.selectAll('text').remove();
		}

		// Prevents the event from being re-catched by “graph”.
		d3.event.stopPropagation();

	}
	//--------------------------------------

	function create_nodes_and_links(pools)
	{
		var links = [];
		var hosts = [];
		var vms   = [];


		var save_id = 0;
		var min_mass = 1 ;
		var max_mass = 100 ;
		var save_mass = 0 ;


		// Finds all nested hosts and VMs, defines their “type”
		// attribute and creates links to their parent.
		_.each(pools, function (pool) {
			pool.type = TYPE_POOL;
			pool.id = save_id ;
			save_id = save_id + 1 ;

			pool.mass = pool.hosts.length * 15;
			pool.ram = _.random(min_mass, max_mass);

			_.each(pool.hosts, function (host,i) {
				hosts.push(host);

				host.type = TYPE_HOST;
				host.id = save_id ;
				save_id = save_id + 1 ;

				if ( save_mass < host.vms.length ) {
					save_mass=host.vms.length;
				}

				host.mass = host.vms.length * 7.5;

				host.ram = _.random(min_mass, max_mass);

				links.push({
					'source': host,
					'target': pool,
					'distance': host_distance,
				});

					// For angle computing we need to access its host.
					host.pool = pool;

				_.each(host.vms, function (vm,i) {
					vms.push(vm);

					vm.type = TYPE_VM;
					vm.id = save_id ;
					save_id = save_id + 1 ;

					vm.mass = _.random(15, 25);
					vm.ram = _.random(min_mass, max_mass);

					// For angle computing we need to access its host.
					vm.host = host;

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
		var radius = (pool_distance * (save_mass/25)) * pools.length ;

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

	function tick () {

		/* useless because they are freeze
			pool_node.attr(
				'transform',
				function (d) {
					return 'translate('+ d.x +','+ d.y +')';
				}
			);
		*/

			host_node.attr(
				'transform',
				function (d) {
					return 'translate('+ (d.x)+','+ (d.y) +')';
				}
			);

			host_node.select('path').attr(
				'transform',
				function (d) {
					var x = d.pool.x - d.x;
					var y = d.pool.y - d.y;

					var angle = Math.acos(x / Math.sqrt(x*x + y*y)) / Math.PI * 180 + 180;

					return 'rotate('+ (y < 0 ? -angle : angle) +')';
				}
			);

			vm_node.attr(
				'transform',
				function (d) {
					return 'translate('+ (d.x) +','+ (d.y) +')';


				}
			);
			vm_node.select('path').attr(
				'transform',
				function (d) {
					var x = d.host.x - d.x;
					var y = d.host.y - d.y;

					var angle = Math.acos(x / Math.sqrt(x*x + y*y)) / Math.PI * 180 + 180;

					return 'rotate('+ (y < 0 ? -angle : angle) +')';
				}
			);

			link
				.attr('x1', function(d) { return d.source.x; })
				.attr('y1', function(d) { return d.source.y; })
				.attr('x2', function(d) { return d.target.x; })
				.attr('y2', function(d) { return d.target.y; })
			;
	}
}
