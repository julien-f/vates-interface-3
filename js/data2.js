!function () {
	'use strict';

	var pools = [];

	var i1 = setInterval(function () {
		if (pools.length > 20)
		{
			return;
		}

		var pool = {
			'label': 'Pool ' + _.random(1000),
			'hosts': []
		};
		for (var i = 0, n = _.random(1, 4); i < n; ++i)
		{
			pool.hosts[i] =  { 'label': 'Host '+ i };
		}

		pools.push(pool);

		window.refresh(pools);
	}, 10);

	var i2 = setInterval(function () {
		pools.splice(_.random(pools.length - 1), 1);

		window.refresh(pools);
	}, 15);

	setTimeout(function () {
		clearInterval(i1);
		clearInterval(i2);
	}, 400);
}();
