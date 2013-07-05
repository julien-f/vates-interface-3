/* exported polygon */
function polygon(object, nb_edges,radius)
{
	'use strict';

	var coords = [];
	var angle = 2 * Math.PI/nb_edges;

	for (var i =0; i < nb_edges; ++i)
	{
		var angle_i = angle * i;

		coords.push(
			Math.cos(angle_i) * radius, // x
			Math.sin(angle_i) * radius  // y
		);
	}

	return object.append('path')
		.attr('d','M'+ coords.join(' ') +'Z');
}
