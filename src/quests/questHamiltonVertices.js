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
		edge.active = false
	}
	for(let facet of viewer.facets) {
		facet.active = false
	}
	viewer.setVisible(viewer.facets, false)



	let selectedVertices = [];
	let selectedEdges = [];
	let adjacentEdges = [];
	let selectedVertex, edge, adjacentVertices


	viewer.onObjectClick(function(object) {
		updateSelectedEdges(object)
		updateSelectedVertices(object)
		
		if (selectedVertices.length) {			 
			selectedVertex = selectedVertices[selectedVertices.length-1];
			adjacentVertices = getAdjacentVertices(selectedVertex);
			adjacentEdges = getIncidentEdges(selectedVertex);

			finishCycle();
			updateVertices();
			updateEdges();
		}
		else { viewer.reset() }
		evaluate();
		
		
		
		
		
		
		
		function updateSelectedVertices(object) {
			//updates the list of selected vertices
			if (object.selected) {
				selectedVertices.push(object) 
			}
			else {
				selectedVertices.splice(selectedVertices.length-1,1)
			}
		}
		
		function updateSelectedEdges(object) {
			//updates the list of selected edges
			if (object.selected) {
				if (selectedVertices.length) {
					selectedEdges.push(viewer.getEdge(selectedVertices[selectedVertices.length-1],object)) 
				}
			}
			else {
				if (selectedVertices.length > 1) {
					selectedEdges = deleteIncidentEdge(object, selectedEdges)
				}
			}
		}
		
		function updateVertices() {
			//updates properties of each vertex
			for(let vertex of viewer.vertices) {
				edge = viewer.getEdge(vertex,selectedVertex);
				if (vertex==selectedVertex) {
					vertex.active = true;
				}
				else if (viewer.isObjectContained(vertex,adjacentVertices) 
				&& !viewer.isObjectContained(vertex,selectedVertices)) {
					vertex.active = true;
					vertex.marked = true;
				}
				else if (!viewer.isObjectContained(vertex,selectedVertices)){
					vertex.active = false;
					vertex.marked = false;
				}
				else {
					vertex.active = false;
				}
				
			}
			
		}
		
		function updateEdges() {
			//updates properties of each edge
			for(let edge of viewer.edges) {
				if (viewer.isObjectContained(edge,selectedEdges)) {
					edge.selected = true;
				}
				else if (viewer.isObjectContained(edge,adjacentEdges)) {
					edge.selected = false;
					edge.marked = true;
				}
				else {
					edge.marked = false;
				}
			}
		};

		function finishCycle() {
			//finishes a complete path to a cycle if possible
			if (selectedVertices.length==viewer.vertices.length) {
				if (viewer.getEdge(selectedVertices[0],selectedVertices[selectedVertices.length-1])) {
					selectedEdges.push(viewer.getEdge(selectedVertices[0],selectedVertices[selectedVertices.length-1]))
				}
			}
		}
		 
		function getIncidentEdges(selectedVertex) {
			//returns all edges incident to a vertex
			let edge;
			let adj = [];
			for (let vertex of viewer.vertices) {
				edge = viewer.getEdge(selectedVertex,vertex);
				if(edge && !viewer.isObjectContained(edge,selectedEdges) && !viewer.isObjectContained(vertex,selectedVertices)) {
					adj.push(edge)
				}
			}
			return adj;
		}

		function getAdjacentVertices(selectedVertex) {
			//returns all vertices adjacent to a vertex
			let adjacent = [];
			for (let vertex of viewer.vertices) {
				if(viewer.getEdge(vertex, selectedVertex)) {
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

	viewer.reset = function() {
		selectedVertices = [];
		selectedEdges = [];
		adjacentEdges = [];
		for(let vertex of viewer.vertices) {
			vertex.active = true;
			vertex.selected=false;
			vertex.marked=false;
		}
		for(let edge of viewer.edges) {
			edge.defaultColor();
			edge.selected=false;
			edge.marked=false;
		}
	}

	function evaluate() {
		if(isHamiltonianCycle()) {
			viewer.draw();
			alert("Hamiltonian Cycle");
		}
		else if(isHamiltonianPath()) {
			viewer.draw();
			alert("Hamiltonian Path");
		}
		else if(endOfGame()) {
			viewer.draw();
			alert("end of game");
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
}


function createViewer(id,mobile) {
    $.ajax({
        //url: "https://www.polytopia.eu/sandbox/viewer/src/json/poly_"+id+".json",
        url: "src/json/Polyhedron_"+id+".json",
        dataType: 'json',
        error: function(jqXHR, textStatus, errorThrown){alert(errorThrown)}  
    }).done(function ( data ) { initViewer(data,mobile) } );
}



