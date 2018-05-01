'use strict';


function createData(data) {
    data.vertices = data.vertices.map(function (pos) {
        return {position : new THREE.Vector3(pos[0],pos[1],pos[2])}
    });
    data.edges = data.edges.map(function (id) {
        return {vertices: [data.vertices[id[0]], data.vertices[id[1]]]}
    });
    data.facets = data.facets.map(function (list) {
        let vertices = [];
        for (let i=0; i<list.length; i++) {
            vertices.push(data.vertices[list[i]]);
        }
        return {vertices: vertices, color: '0x999009'}
    });
    console.log(data)
    return data;
}; 

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




