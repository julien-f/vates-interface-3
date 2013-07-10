/* exported polygon */
function polygon(object, nb_edges,radius,alpha)
{
	'use strict';

	var angle = 2 * Math.PI/nb_edges;

	function path(d)
	{
		var coords = [];

		var r = radius(d);
		for (var i =0; i < nb_edges; ++i)
		{
			var angle_i = angle * i + alpha  ;

			coords.push(
				Math.cos(angle_i) * r, // x
				Math.sin(angle_i) * r  // y
			);
		}

		return ('M'+ coords.join(' ') +'Z');
	}

	// @todo Ugly code: replace.
	if (!_.isFunction(radius))
	{
		radius = function (radius) {
			return function () {
				return radius;
			};
		}(radius);
		path = path();
	}

	return object.append('path')
		.attr('d', path);
}
