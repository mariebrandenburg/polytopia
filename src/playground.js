'use strict';

let container;
let v, rawData;


function initViewer(data, mobile) {
	rawData = Object.assign({},data);
    let coordinates = createData(data);
    container = document.getElementById("viewer");
    let viewer = new PolytopeViewer(container,mobile);
    v = viewer;

    //add polytope to viewer
    viewer.vertexSize = 0.07
    viewer.setPolytope(coordinates.vertices, coordinates.edges, coordinates.facets);
	for(let edge of viewer.edges) {
		//edge.active = false
	}
	for(let facet of viewer.facets) {
		//facet.active = false
	}
	//viewer.setVisible(viewer.facets, false)



	let selectedVertices = [];
	let selectedEdges = [];
	let adjacentEdges = [];

	
	viewer.onObjectClick(function(object) {
		console.log(object)
	 });


	viewer.onObjectHover(function(object) {
		//console.log(object)
	});


}




function createViewer(id,mobile) {
    $.ajax({
        //url: "https://www.polytopia.eu/sandbox/viewer/src/json/poly_"+id+".json",
        url: "src/json/Poly_"+id+".json",
        dataType: 'json',
        error: function(jqXHR, textStatus, errorThrown){alert(errorThrown)}  
    }).done(function ( data ) { initViewer(data,mobile) } );
}
