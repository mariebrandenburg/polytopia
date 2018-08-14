'use strict';

let container;
let v, rawData;
let reload;


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
		edge.active = false
	}
	for(let facet of viewer.facets) {
		facet.active = false
	}



	let selectedVertices = [];
	let selectedEdges = [];
	let adjacentEdges = [];

	
	viewer.onObjectClick(function(object) {
		//update the selectedX lists
		if (object.selected) {
			if (selectedVertices.length) {
				selectedEdges.push(getEdge(selectedVertices[selectedVertices.length-1],object)) 
			}
			selectedVertices.push(object) 
		}
		else {
			if (selectedVertices.length > 1) {
				selectedEdges = deleteIncidentEdge(object, selectedEdges)
			}
			selectedVertices.splice(selectedVertices.length-1,1)
		}
		
					 

		if (selectedVertices.length) {			 
			let selectedVertex = selectedVertices[selectedVertices.length-1];
			let adjacentVertices = getAdjacentVertices(selectedVertex);
			adjacentEdges = getAdjacentEdges(selectedVertex);
			let edge;
			
			//finishes a complete path to a cycle if possible
			if (selectedVertices.length==viewer.vertices.length) {
				if (getEdge(selectedVertices[0],selectedVertices[selectedVertices.length-1])) {
					selectedEdges.push(getEdge(selectedVertices[0],selectedVertices[selectedVertices.length-1]))
				}
			}
			
			//update vertices
			for(let vertex of viewer.vertices) {
				edge = getEdge(vertex,selectedVertex);
				if (vertex==selectedVertex) {
					vertex.active = true;
				}
				else if (isObjectContained(vertex,adjacentVertices) 
				&& !isObjectContained(vertex,selectedVertices)) {
					vertex.active = true;
					markObject(vertex)
				}
				else if (!isObjectContained(vertex,selectedVertices)){
					vertex.active = false;
					unmarkObject(vertex)
				}
				else {
					vertex.active = false;
				}
				
			}
			//update edges
			for(let edge of viewer.edges) {
				if (isObjectContained(edge,selectedEdges)) {
					edge.select();
				}
				else if (isObjectContained(edge,adjacentEdges)) {
					markObject(edge)
				}
				else {
					edge.defaultColor()
				}
			}
		}
		
		else {
			reset();
		}
		


		if(isHamiltonianCycle()) {
			alert("Hamiltonian Cycle");
		}
		else if(isHamiltonianPath()) {
			alert("Hamiltonian Path");
		}
		else if(endOfGame()) {
			alert("end of game");
		}

		 
		function isObjectContained(object,list) {
			for(let element of list) {
				if(object==element) {
					return true
				}
			}
			return false
		}
		
		function getEdge(vertex1,vertex2) {
			//returns edge incident to two vertices
			for (let edge of viewer.edges) {
				if((edge.abstract.vertices[0]==vertex1.abstract
					&& edge.abstract.vertices[1]==vertex2.abstract)
				|| (edge.abstract.vertices[0]==vertex2.abstract
					&& edge.abstract.vertices[1]==vertex1.abstract)) {
					return edge;
				}
			}
		}
		
		function getAdjacentEdges(selectedVertex) {
			let edge;
			let adj = [];
			for (let vertex of viewer.vertices) {
				edge = getEdge(selectedVertex,vertex);
				if(edge && !isObjectContained(edge,selectedEdges) && !isObjectContained(vertex,selectedVertices)) {
					adj.push(edge)
				}
			}
			return adj;
		}

		function getAdjacentVertices(selectedVertex) {
			let adjacent = [];
			for (let vertex of viewer.vertices) {
				if(getEdge(vertex, selectedVertex)) {
					adjacent.push(vertex);
				}
			}
			return adjacent;
		}
		
		function deleteIncidentEdge(vertex, selectedEdges) {
			//returns list of edges without the edges incident to vertex
			let remaining = []
			for (let edge of selectedEdges) {
				if (edge.abstract.vertices[0]!==vertex.abstract && edge.abstract.vertices[1]!==vertex.abstract) {
					remaining.push(edge)
				}
			}
			return remaining
		}
	 });


	viewer.onObjectHover(function(object) {
		//console.log(object)
	});

	function reset() {
		selectedVertices = [];
		selectedEdges = [];
		adjacentEdges = [];
		for(let vertex of viewer.vertices) {
			unmarkObject(vertex)
			vertex.active = true;
			vertex.selected=false;
		}
		for(let edge of viewer.edges) {
			edge.defaultColor();
			edge.selected=false;
		}
	}
	reload = reset;
	
	function markObject(object) {
		object.marked = true;
		object.mark()
	}
	
	function unmarkObject(object) {
		object.marked = false;
		object.defaultColor()
	}
	
	function isHamiltonianPath() {
		return selectedVertices.length==viewer.vertices.length
	}
	
	function isHamiltonianCycle() {
		return selectedEdges.length==viewer.vertices.length;
	}
	
	function endOfGame() {
		return adjacentEdges.length==0 && selectedVertices.length>0
	}
}




function createViewer(id,mobile) {
    $.ajax({
        //url: "https://www.polytopia.eu/sandbox/viewer/src/json/poly_"+id+".json",
        url: "src/json/Polyhedron_"+id+".json",
        dataType: 'json',
        error: function(jqXHR, textStatus, errorThrown){alert(errorThrown)}  
    }).done(function ( data ) { initViewer(data,mobile) } );
}
