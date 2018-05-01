'use strict';

let container;

//create viewer
container = document.createElement('div');
document.body.appendChild(container);

function initViewer(data) {
    let coordinates = createData(data);
    
    let viewer = new PolytopeViewer(container);

    //add polytope to viewer
    console.log(coordinates);
    viewer.setPolytope(coordinates.vertices, coordinates.edges, coordinates.facets);
    
    viewer.onObjectHover(function(object) {
        //console.log(object)
    });
    viewer.onObjectClick(function(object) {
        //console.log(object)
    });
}


$.ajax({
    //url: "http://poly.mathematik.de/src/json/data_cube.json"
    //url: "http://localhost:8000/src/json/Polyhedron_beispiel.json",
    url: "http://localhost:8000/src/json/dodeca.json",
    //url: "http://localhost:8000/src/json/data_cube.json",
    //url: "http://poly.mathematik.de/src/json/Polyhedron_beispiel.json",
    dataType: 'json',
    error: function(jqXHR, textStatus, errorThrown){
                alert(errorThrown);
            }  
}).done(initViewer);
