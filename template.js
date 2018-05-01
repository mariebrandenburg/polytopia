'use strict';

let container;

//create viewer
container = document.createElement('div');
document.body.appendChild(container);

function initViewer(data) {
    let coordinates = createData(data);
    let viewer = new PolytopeViewer(container);
    
    //add polytope to viewer
    viewer.setPolytope(coordinates.vertices, coordinates.edges, coordinates.facets);
    
    
    //disable response, visibility
	//viewer.setVisible(viewer.vertices,false)
	//viewer.setVisible(viewer.vertices,false)

	//(if they are not visible, then it does not matter if they are active)
    for(let vertex of viewer.vertices) {
    vertex.active = false 
	}
	
	for(let facet of viewer.facets) {
		facet.active = false
	}
    
    
    viewer.onObjectHover(function(object) {
        //console.log(object)
    });
    viewer.onObjectClick(function(object) {
        //console.log(object)
    });
}




$.ajax({
    //url: "http://poly.mathematik.de/src/json/data_cube.json"
    url: "http://localhost:8000/src/json/dodeca.json",
    dataType: 'json',
    error: function(jqXHR, textStatus, errorThrown){
                alert(errorThrown);
            }  
}).done(initViewer);
