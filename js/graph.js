// Création du SVG et instanciation du graphe.
!function () {

	///////////////////////////////////
	// keep page propreyty.
	var w = window,
		d = document,
		e = d.documentElement,
		g = d.getElementsByTagName('body')[0];
	///////////////////////////////////Ò
	// molecule_graph.
	// pie_graph_HOST_RAM.

	'use strict';

	var width = winDim().w;
	var height =winDim().h;
	var coeff =height/200;

	var svg = d3.select('body').append('svg')
		.attr('width', width)
		.attr('height', height)

	;

	// ajoute des boutons
    //------------------------------------------

	 var graph = svg.append('g')
		.attr(
			'transform',
			'translate('+width/2+','+height/2+') scale('+ coeff+')'
		)
	;
	button_graph(graph, data, width/coeff);

    //------------------------------------------


	var graph = svg.append('g')
		.attr(
			'transform',
			'translate('+width/2+','+height/2+') scale('+ coeff+')'
		)
	;

	// Dessine le graphe dans l'élément graph.
	 molecule_graph(graph, data, width/coeff);

    //------------------------------------------
    // Take windows dimansion.
	function winDim()
	{

		var W,H,
			i = window,
			d = document,
			de = d.documentElement,
			db = d.body;

		if ( i.innerWidth )
		{			 // other of IE
			W = i.innerWidth;
			H = i.innerHeight;
		}
		else if ( de.clientWidth )
		{ // IE8
			W = de.clientWidth;
			H = de.clientHeight;
		}

		else
		{ // IE6
			W = db.clientWidth;
			H = db.clientHeight;
		}

		return {w:W,h:H} ;
	}
	// END OF WINDIM
	////////////////////////////////////////


}();
