'use strict';


//data input


/*
let edges_input = [
    [1,1,2],
    [2,1,4],
    [3,1,5],
    [4,2,3],
    [5,2,6],
    [6,3,4],
    [7,3,7],
    [8,4,8],
    [9,5,6],
    [10,5,8],
    [11,6,7],
    [12,7,8]
];

let facets_input = [];

let edges = [];
let vertexSet = [];
for (let i=0;i<edges_input.length;i++) {
	vertexSet = [];
	//go through all vertices of the edge
	for(let j=1;j<edges_input[i].length;j++) {
		//go through all vertices
		for(let k=0;k<vertices.length;k++) {
			if(vertices[k].id == edges_input[i][j])
			vertexSet.push(vertices[k])
		}
	}
	edges.push({id: edges_input[0], vertices: vertexSet})
}
*/

let vertices = [
    {id: 1, position: new THREE.Vector3(-1, -1, -1)},
    {id: 2, position: new THREE.Vector3(1, -1, -1)},
    {id: 3, position: new THREE.Vector3(1, 1, -1)},
    {id: 4, position: new THREE.Vector3(-1, 1, -1)},
    {id: 5, position: new THREE.Vector3(-1, -1, 1)},
    {id: 6, position: new THREE.Vector3(1, -1, 1)},
    {id: 7, position: new THREE.Vector3(1, 1, 1)},
    {id: 8, position: new THREE.Vector3(-1, 1, 1)}
];


let edges = [
    {id: 1,  vertices: [vertices[0], vertices[1]]},
    {id: 2,  vertices: [vertices[0], vertices[3]]},
    {id: 3,  vertices: [vertices[0], vertices[4]]},
    {id: 4,  vertices: [vertices[1], vertices[2]]},
    {id: 5,  vertices: [vertices[1], vertices[5]]},
    {id: 6,  vertices: [vertices[2], vertices[3]]},
    {id: 7,  vertices: [vertices[2], vertices[6]]},
    {id: 8,  vertices: [vertices[3], vertices[7]]},
    {id: 9,  vertices: [vertices[4], vertices[5]]},
    {id: 10, vertices: [vertices[4], vertices[7]]},
    {id: 11, vertices: [vertices[5], vertices[6]]},
    {id: 12, vertices: [vertices[6], vertices[7]]}
];

let facets = [
    {id: 1, vertices: [vertices[0], vertices[3], vertices[4], vertices[7]], color: '0x999009'},
    {id: 2, vertices: [vertices[0], vertices[1], vertices[4], vertices[5]], color: '0x999009'},
    {id: 3, vertices: [vertices[0], vertices[1], vertices[2], vertices[3]], color: '0x999009'},
    {id: 4, vertices: [vertices[1], vertices[2], vertices[5], vertices[6]], color: '0x999009'},
    {id: 5, vertices: [vertices[2], vertices[3], vertices[6], vertices[7]], color: '0x999009'},
    {id: 6, vertices: [vertices[4], vertices[5], vertices[6], vertices[7]], color: '0x999009'}
];




/*
let vertices = [
    {id: 1, position: new THREE.Vector3(-0.5, -0.5, -0.5)},
    {id: 2, position: new THREE.Vector3(1, 0, 0)},
    {id: 3, position: new THREE.Vector3(0, 1, 0)},
    {id: 4, position: new THREE.Vector3(0, 0, 1)}
];

let edges = [
    {id: 1,  vertices: [vertices[0], vertices[1]]},
    {id: 2,  vertices: [vertices[0], vertices[2]]},
    {id: 3,  vertices: [vertices[0], vertices[3]]},
    {id: 4,  vertices: [vertices[1], vertices[2]]},
    {id: 5,  vertices: [vertices[1], vertices[3]]},
    {id: 6,  vertices: [vertices[2], vertices[3]]}
];

let facets = [
    {id: 1, vertices: [vertices[0], vertices[1], vertices[2]], color: '0x001111'},
    {id: 2, vertices: [vertices[0], vertices[1], vertices[3]], color: '0x332254'},
    {id: 3, vertices: [vertices[0], vertices[2], vertices[3]], color: '0x556633'},
    {id: 4, vertices: [vertices[1], vertices[2], vertices[3]], color: '0x552200'}
];
*/




