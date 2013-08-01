function button_graph(graph, data, width)
{
	'use strict';

	//--------------------------------------

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
	;

	//--------------------------------------
	// resize coeff

	var coeff = 0.5   ; // one on the scale in graph.js
	var button = group.attr('class','button')
			.attr(
					'transform',
					'translate('+ (-width/2+100*coeff) +','+ (-100+100*coeff) +') scale('+coeff+')'
				)
			;
	//var transcoeff = -(coeffic  * 100 );


	var transX = 0;
	var transY = 0;

	button.attr('transform', 'translate('+transX+','+transY+')') // Initial translation * by the coeff.
	polygon(button, 4,15,0).attr('fill', 'green');



	button.attr('transform', 'translate('+transX+','+transY+')') // Initial translation * by the coeff.
	polygon(button, 4,15,0).attr('fill', 'green');



	button.attr('transform', 'translate('+transX+','+transY+')') // Initial translation * by the coeff.
	polygon(button, 4,15,0).attr('fill', 'green');


}