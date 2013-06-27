/**
 * Fonction qui dessine le graphe centré en (0, 0) et s'étendant de [-100, 100] en x et en y.
 */
function molecule_graph(graph, data)
{
	'use strict';

	///////////////////////////////////
	//set graph propreitis
	var gravity = 0.6;
	var duration = 400;
	var mid_x = 500;
	var mid_y = 300;
	var rayon = 4 ;
	var espace = 1 ;
	var linkdist = 10;
	var charge = -40;
	var w = 200;
	var h = 200;
	var scale_zoom = 5 ; 				// fixed scale when click on the node
	///////////////////////////////////

	var save_translate = 0 ;
	var save_scale = 1 ;	// save the position for p.
	var No; 							// need to save past number of node.
	var activate; 					    // solve the problem with zoom and move.

	var TYPE_POOL = 0;
	var TYPE_HOST = 1;
	var TYPE_VM   = 2;



	var link;
	var node;

	var colors = d3.scale.category10();

	var force = d3.layout.force()
		.on("tick", tick)
		.size([w, h])
		;

	var svgclip= graph.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("id", "clip-rect")
		.attr("width",w)
		.attr("height",h)

	var move_graph = graph.append("g")
		.attr("clip-path", "url(#clip)")
			move_graph.attr(
							"transform",
							"translate("+mid_x+","+mid_y+")");

    var rect = move_graph.append("g").append('rect')
        .attr('width', w)
        .attr('height', h)
        .attr('fill', 'white')
        .attr("stroke","black");

	var selection= move_graph.append("g")

	///////////////////////////////////
	// SVG INTERACTIVITY
	move_graph.on("dblclick", reset_view);
	move_graph.on("click", previous_view);

	var zoom = d3.behavior.zoom();

	move_graph.call(zoom.on("zoom", function () {
				if (activate)
				{
					reset_view();
				}
				selection.attr(
					"transform",
				"translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")"
				);
				save_translate = d3.event.translate ;
				save_scale = d3.event.scale ;

			}))
	        .on("dblclick.zoom", null)
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
		.charge(charge)
		.linkDistance(function (link) {
			return link.distance || linkdist;
		})
		.gravity(gravity)
	;
	update();
	////////////////////////////////////////

	function update()
	{
		force.start();

		// Updates the links.
		link = selection.selectAll(".link")
			.data(links, function(d, i) {
				return i;
			})
		;

		// Enter any new links.
		link.enter().insert("line", ".link")

			.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; })
			.attr('stroke', 'black')
			.classed("link")
		;

		// Exit any old links.
		link.exit().remove();


		// Marche à suivre :
		// 1. Sélectionner les nodes (groupes avec la classe "node") existants.
		// 2. Pour les nodes manquants (sélection "enter") :
		//    1. Créer un groupe avec la classe "node".
		//    2. Créer le circle avec la bonne couleur.
		//    3. Créer le texte avec le label.
		// 3. Pour les nodes en trop (sélection "exit") : les supprimer.
		// 4. Pour tous les nodes existants : mettre à jour leur coordonnées (attribut "transform").

		// Update the nodes.
		node = selection.selectAll(".node")
			.data(nodes, function(d, i) {
				return i;
			})
		;

		//create groups for each node
		var new_node  = node.enter()
			.append("g")
			.classed("node",true);


		new_node
			.append("circle")
			.attr("r", rayon)
			.attr("fill", function (d) {
				return colors(d.type);
			})
			.on("click", node_view)
		;


		new_node.append("text")
			.text(function(d) { return d.label})
			.on("click", node_view)
		;

		// Exit any old nodes.
		node.exit().remove();
	}

	// END OF UPDATE
	////////////////////////////////////////
	// TICK FUNCTION

	function tick()
	{
		link
			.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; })
		;

		node
			.attr(
				"transform",
				function (d, i) {
					return "translate("+ d.x +","+ d.y +")";
				}
			);
		;
		;
	}
	//END OF TICK
	////////////////////////////////////////
	// POINTER EVENT FUNCTION

	function node_view (d,current)
	{
		if (current == No)
		{
			previous_view();
		}
		else
		{
			node.classed("selected", function (d, i) {
				return (i === current);
			});

			var x = (w/2-d.x*scale_zoom);
			var y = (h/2-d.y*scale_zoom);

			selection.transition().duration(duration).attr(
				"transform",
				"translate("+(x) +","+(y) +") scale(" +scale_zoom+ ")"
			);
			No = current ;

			node.select("circle").transition().duration(duration).style("fill", function (d, i) {
				if (current === i)
				{
					return null;
				}
				var old = d3.rgb(d3.select(this).attr("fill"));
				var bg = d3.rgb('white');

				return d3.rgb(
					old.r * 0.1 + bg.r * 0.9,
					old.g * 0.1 + bg.g * 0.9,
					old.b * 0.1 + bg.b * 0.9
				).toString();
			});

			link.transition().duration(duration).style("stroke-opacity",0.1);

			d3.event.stopPropagation();// stop to go back in the SVG DOM.
		}
		activate = true ;
	}
	// END OF NODE_VIEW
	////////////////////////////////////////
	// RESET THE VIEW

	function reset_view()
	{
		node.classed("selected", false);

		selection.transition().duration(duration).attr(
			"transform",
			"translate(0, 0)"
		);

		node.select("circle").transition().duration(duration).style("fill", null)
		link.transition().duration(duration).style("stroke-opacity",1);

		zoom.translate([mid_x, mid_y]);
		zoom.scale(1);

		activate = false ;

		No = 0;
	}
	// END OF RESET_VIEW
	////////////////////////////////////////
	// BACK TO THE PAST VIEW BEFORE ZOOM ON NODE

	function previous_view()
	{
		activate = false ;

		node.classed("selected", false);

		selection.transition().duration(duration).attr(
			"transform",
			"translate(" + save_translate + ") scale(" + save_scale + ")"
		);

		node.select("circle").transition().duration(duration).style("fill", null)
		link.transition().duration(duration).style("stroke-opacity",1);

		No = 0 ;
	}
	// END OF PREVIOUS_VIEW
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
			pool.x = Math.cos(alpha_i) * espace + mid_w;
			pool.y = Math.sin(alpha_i) * espace + mid_h;
		});

		var alpha = TWO_PI / hosts.length;
		_.each(hosts, function (host, i) {
			var alpha_i = alpha * i;
			host.x = Math.cos(alpha_i) + espace * 2 + mid_w;
			host.y = Math.sin(alpha_i) + espace * 2  + mid_h;
		});

		var alpha = TWO_PI / vms.length;
		_.each(vms, function (vm, i) {
			var alpha_i = alpha * i;
			vm.x = Math.cos(alpha_i) + espace * 3 + mid_w;
			vm.y = Math.sin(alpha_i) + espace * 3 + mid_h;
		});

		return [
			pools.concat(hosts, vms),
			links
		];
	}
	// END OF create_nodes_and_links
	////////////////////////////////////////

}


// Création du SVG et instanciation du graphe.
!function () {
	'use strict';


	///////////////////////////////////
	// keep page propreyty.
	var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0];
	///////////////////////////////////

	var	w = winDim().w ;
	var	h = winDim().h ;


	var svg  = d3.select("body").append("svg")
		.attr("width", "100%")
		.attr("height","100%")
		.attr("viewBox", "0 0 " + w + " " + h )
        .attr("pointer-events", "all")
    ;

    var graph = svg.append("g")

	// SIZE THE WINDOW AT THE BEGINING

	function winDim() {

		var W,H,
			i = window,
			d = document,
			de = d.documentElement,
			db = d.body;

		if ( i.innerWidth ) { // other of IE
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
	// END OF WINDIM
	////////////////////////////////////////

	// Dessine le graphe dans l'élément graph.
	molecule_graph(svg, data);
}();
