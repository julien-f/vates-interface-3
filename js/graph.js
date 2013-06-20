//# Additional custom forces and constraints may be applied on the "tick" event.

var height = 1000;
var width  = 1000;

// Variables de construction des cercles.
var r_pools = 100;
var r_hosts = r_pools*1.5;

// Math constants.
var TWO_PI = 2 * Math.PI;


// Constructs a new force-directed layout with the default settings:
var force = d3.layout.force()
	// A negative value results in node repulsion, while a positive value results in node attraction.
	.charge(-120)
	// sets the target distance between linked nodes.
	.linkDistance(30)
	.size([width, height]);

// Create the graph.
var svg = d3.select('body').append('svg')
	.attr('height', height)
	.attr('width', width)
	.attr('transform', 'translate('+ width/2 +','+ height/2 +')')
	;
;

////////////////////////////////////////////////////////////////////////////////

/**
 * This generator returns a function which can be used to
 * calculate coordinates of points on a arc.
 *
 * @param {integer} n The number of points on the arc.
 * @param {number} r Radius of the arc.
 * @param {number} alpha Angle of the arc.
 * @param {number} beta Angle shift from the horizontal.
 *
 * @return {function(*, integer): Array.<number>} [description]
 */
var coordFunc = function (n, r, alpha, beta)
{
	var angle = alpha / n;

	return function (d, i) {
		var angle_i = angle * i + beta;

		return [
			Math.cos(angle_i) * r,
			Math.sin(angle_i) * r
		];
	};
};

////////////////////////////////////////////////////////////////////////////////
// link between data and force.
force
	.start();

///////////////////////////////////////
// POOLS
//links between all pool element with data.

var n = data.length;


var pools =  svg.selectAll('g.pool').data(data,
								function (pool) {
									return pool.label;
								})
				.attr('class','pool').enter()
				.append('g')
				.append('circle')
				.attr('r', 25)
				.call(force.drag);
			;

// Sets position for all existing pools.
var f = coordFunc(
	n,       // Number of pools.
	r_pools, // Radius of the “pool”-circle.
	TWO_PI,  // This is a circle so its angle is 2pi.
	0        // No angle shift.
);
pools.attr('transform', function (pool, i) {
	return ('translate('+ f(pool, i).join(',') +')');
});

///////////////////////////////////////
// HOSTS
var hosts =  svg.selectAll('g.host').data(data,
								function (pool) {
									return pool.hosts;
								},
								function (host) {
									return host.label;
								})
				.attr('class','hosts').enter()
				.append('g')
				.append('circle')
				.attr('r', 15)
				.call(force.drag);
			;


var fh = [];
	for (var i = 0; i < n; i++)
	{
		// Sets position for all existing pools.
		fh[i] = coordFunc(
			data[i].hosts.length,       // Number of pools.
			r_hosts, // Radius of the “pool”-circle.
			TWO_PI/n,  // This is a circle so its angle is 2pi.
			-TWO_PI/n/2 + TWO_PI/n*i   // No angle shift.
		);
	}

///////////////////////////////////////
// LINKS


var links = pools.selectAll('line').data(data,
										function (pool) {
											return pool.hosts;
										},
										function (host) {
											return host.label;
										}
										)
				.enter().append('line')
				.attr('stroke', 'black')
			;

force.on("tick", function() {
	links
		.attr('x2', function (host, i, j) {
			return fh[j](host, i)[0];
			})
	   	.attr('y2', function (host, i, j) {
			return fh[j](host, i)[1];
			})

	pools
		.attr('cx', function (host, i) {
			return f(host, i)[0];
			})
	   	.attr('cy', function (host, i) {
			return f(host, i)[1];
			})

    hosts
		.attr('cx', function (host, i, j) {
			return fh[j](host, i)[0];
			})
		.attr('cy', function (host, i, j) {
			return fh[j](host, i)[1];
			})


 });