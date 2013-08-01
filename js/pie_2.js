function pie_2_graph(graph,data) {
	'use strict';
	// DATA
	var data_lab = [
		{'IP' : '192,168,0,1'},
		{'label': 'lab 1'}
	];
	var data_CPU = [
		{'NB_CPU' : '4'},
		{'CPU'  : '4'},
		{'CPU' : '5'},
		{'CPU' : '10'},
		{'CPU' : '20'}
	];
	var data_RAM = [
		{'RAM_MAX' : '7881'},
		{'RAM_USE'  : '3242'}
	];
	//--------------------------------------
	var color = d3.scale.category20();
	//--------------------------------------

	// Background element which allows us to get pointer events.
	var area = graph.append('rect')
		.attr('x', -100)
		.attr('y', -100)
		.attr('width', 200)
		.attr('height', 200)
		.attr('fill', 'white')
	;
	//--------------------------------------
	var group = graph.append('g').attr('transform','translate ('+(0)+','+(100)+')')
	;
	var PI = Math.PI;
	//----------------------------------------------------------------------------
	// CPU VAR
	var tmp_DATA = all_CPU_usage(data_CPU);

	var arc = d3.svg.arc() //Constructs a new arc generator
    	.outerRadius(40)
    	.innerRadius(30)
    ;
    var pie = d3.layout.pie()
		.startAngle(-PI/2)
		.endAngle(PI/2)
		.sort(null)
		.value(function(d){ return d; })
	;
	//--------------------------------------

	group.append("text")
		.attr('dy',-15)
		.attr('dx',-10)
		.style('font-size','0.4em')
		.text(data_lab[1].label);

	group.append("text").attr('dy',-1)
		.attr('dx',-15)
		.style('font-size','0.4em')
		.text(data_lab[0].IP);

	//--------------------------------------
	// CPU DONUTS
	var	donuts_CPU = group
		.selectAll('.path').data(pie(tmp_DATA))
	;

	var new_donuts = donuts_CPU
		.enter()
		.append('g')
		.attr('class','arc')
	;
	new_donuts
		.append('path')
		.attr('d', arc)
		.style('fill',function (d,i) {return color(i) })
	;
	// draw arc text
	arc = d3.svg.arc() //Constructs a new arc generator
    	.outerRadius(40)
    	.innerRadius(45)
    	.startAngle(-PI/2)
    	.endAngle(PI/2)
    ;

    donuts_CPU
    	.append('path')
		.attr('d', arc)
		.attr('id','cpu')
		.style('fill','white')
	;
	var text =  donuts_CPU
		.append('text')
		.attr('dy',-1)
		.attr('dx',20)
		.style('font-size','0.4em')
	;
	text.append('textPath')
		.attr('d', arc)
		.attr('xlink:href', '#cpu')
		.text('CPU USAGE : '+ tmp_DATA[0] +'% of 4 CPUs')
	;
	//----------------------------------------------------------------------------
	// RAM VAR

	 arc = d3.svg.arc() //Constructs a new arc generator
    	.outerRadius(60)
    	.innerRadius(50)
    ;
     pie = d3.layout.pie()
		.startAngle(-Math.PI/2)
		.endAngle(Math.PI/2)
		.sort(null)
		.value(function(d,i){ return d; })
	;
	//--------------------------------------
	// RAM DONUTS
	var freeRAM = parseInt(data_RAM[0].RAM_MAX)-parseInt(data_RAM[1].RAM_USE)

	tmp_DATA = [freeRAM ,parseInt(data_RAM[0].RAM_MAX)];

	var	donuts_RAM = group.selectAll('.path').data(pie(tmp_DATA))

	;
	var new_donuts = donuts_RAM
		.enter().append('g')
		.attr('class','arc')
	;
	new_donuts
		.append('path')
		.attr('d', arc)
		.style('fill',function (d,i) {  return color(i+2) })
	;
	// draw arc text
	arc = d3.svg.arc() //Constructs a new arc generator
    	.outerRadius(60)
    	.innerRadius(65)
    	.startAngle(-PI/2)
    	.endAngle(PI/2)
    ;
    donuts_RAM
    	.append('path')
		.attr('d', arc)
		.attr('id','ram')
		.style('fill','white')
	;
	var text =  donuts_RAM
		.append('text')
		.attr('dy',-1)
		.attr('dx',20*2)
		.style('font-size','0.4em')
	;
	text.append('textPath')
		.attr('d', arc)
		.attr('xlink:href', '#ram')
		.text('USED MEMORY : '+tmp_DATA[0]+' of '+tmp_DATA[1]+' memory')
	;
	//----------------------------------------------------------------------------
	// line

	 arc = d3.svg.arc() //constructs a new arc generator
    	.outerRadius(71)
    	.innerRadius(70)
    	 .startAngle(-PI/2)
    	.endAngle(PI/2)
    ;
     pie = d3.layout.pie()
		.startAngle(-Math.PI/2)
		.endAngle(Math.PI/2)
		.sort(null)
	;
	    donuts_RAM
    	.append('path')
		.attr('d', arc)
		.style('fill','black')
	;

	 arc = d3.svg.arc() //constructs a new arc generator
    	.outerRadius(82)
    	.innerRadius(81)
    	 .startAngle(-PI/2)
    	.endAngle(PI/2)
    ;
     pie = d3.layout.pie()
		.startAngle(-Math.PI/2)
		.endAngle(Math.PI/2)
		.sort(null)
	;
	    donuts_RAM
    	.append('path')
		.attr('d', arc)
		.style('fill','black')
	;


	//----------------------------------------------------------------------------

	function all_CPU_usage (data_CPU)
	{
		var CPU_usage = 0;
			for (var i = 1 ; i< data_CPU.length; ++i)
			{
				CPU_usage += parseInt(data_CPU[i].CPU)	;
			}
		CPU_usage = CPU_usage / parseInt(data_CPU[0].NB_CPU) ;
		return [
				CPU_usage,
				100-CPU_usage
			];
	}
};