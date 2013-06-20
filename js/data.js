/**
 * Ici on déclare les données que nous souhaitons afficher.
 *
 * Nous avons deux /pools/ regroupant des /hosts/ (serveurs physiques)
 * qui hébergent des /VMs/ (machines virtuelles).
 *
 * Chacun de ces objets a une propriété /label/ que nous souhaitons
 * afficher sur le graphe.
 */
var data = [
	{
		"label": "Pool 1",
		"hosts": [
			{
				"label": "Host 1",
				"vms": [
					{ "label": "VM 1" },
					{ "label": "VM 2" },
					{ "label": "VM 3" },
					{ "label": "VM 4" },
					{ "label": "VM 5" },
				]
			},
			{
				"label": "Host 2",
				"vms": [
					{ "label": "VM 1" },
					{ "label": "VM 2" },
					{ "label": "VM 3" },
				]
			},
		]
	},
	{
		"label": "Pool 2",
		"hosts": [
			{
				"label": "Host 1",
				"vms": [
					{ "label": "VM 1" },
					{ "label": "VM 2" },
					{ "label": "VM 3" },
					{ "label": "VM 4" },
					{ "label": "VM 5" },
					{ "label": "VM 6" },
					{ "label": "VM 7" },
				]
			}
		]
	},
		{
		"label": "Pool 3",
		"hosts": [
			{
				"label": "Host 1",
				"vms": [
					{ "label": "VM 1" },
					{ "label": "VM 2" },
					{ "label": "VM 3" },
					{ "label": "VM 4" },
					{ "label": "VM 5" },
				]
			},
		]
	},
		{
		"label": "Pool 4",
		"hosts": [
			{
				"label": "Host 1",
				"vms": [
					{ "label": "VM 1" },
					{ "label": "VM 2" },
					{ "label": "VM 3" },
					{ "label": "VM 4" },
					{ "label": "VM 5" },
				]
			},
			{
				"label": "Host 2",
				"vms": [
					{ "label": "VM 1" },
					{ "label": "VM 2" },
					{ "label": "VM 3" },
				]
			},
		]
	},
		{
		"label": "Pool 5",
		"hosts": [
			{
				"label": "Host 1",
				"vms": [
					{ "label": "VM 1" },
					{ "label": "VM 2" },
					{ "label": "VM 3" },
					{ "label": "VM 4" },
					{ "label": "VM 5" },
				]
			},
		]
	},
];
