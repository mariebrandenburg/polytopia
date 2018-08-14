'use strict';

let container;

//create viewer
container = document.createElement('div');
document.body.appendChild(container);
let viewer = new PolytopeViewer(container);

//add polytope to viewer
viewer.setPolytope(vertices, edges, facets);


for(let edge of viewer.edges) {
    edge.active = false
}
for(let facet of viewer.facets) {
    facet.active = false
}
let selectedVertices = [];
let selectedEdges = [];

viewer.onObjectClick(function(object) {
	//let blacklistEdges = getBlacklistEdges();
	
	
	if(object.object_type=='vertex') {
		object.selected ? selectedEdges.push(getEdge(selectedVertices.length-1,object)) 
						 : selectedEdges.splice(selectedEdges.length-1,1)
		object.selected ? selectedVertices.push(object) 
						 : selectedVertices.splice(selectedVertices.length-1,1)

		let selectedVertex = selectedVertices[selectedVertices.length-1];
		let adjacentVertices = getAdjacentVertices(selectedVertex);
		let adjacentEdges = getAdjacentEdges(selectedVertex); //adjacent edges of selected vertex
		let edge;
		console.log(adjacentEdges);
		for(let vertex of viewer.vertices) {
			edge = getEdge(vertex,selectedVertex);
			if (vertex==selectedVertex) {
				vertex.active = true;
			}
			else if (isObjectContained(vertex,adjacentVertices) 
			&& !isObjectContained(vertex,selectedVertices)) {
				activateAdjacentObject(vertex);
			}
			else if (!isObjectContained(vertex,selectedVertices)){
				//deactivate all other vertices but the selected one
				deactivateObject(vertex);
			}
			
		}
		
		
		for(let edge of viewer.edges) {
			console.log(selectedEdges)
			if (isObjectContained(edge,selectedEdges)) {
				edge.select();
			}
			else if (isObjectContained(edge,adjacentEdges)) {
				colorAdjacentObject(edge);
			}
			else {
				//deactivate all other vertices but the selected one
				deactivateObject(edge);
			}
			
		}
	}

	if(object.object_type=='edge') {
		selectVertices(getSelectedVertices());
		unselectOtherVertices(getSelectedVertices());
		
		
		for(let edge of viewer.edges) {
			if (!selected.length) {
				edge.active = true;
				edge.color = '0x999999';
				edge.unhighlight();
			}
			else if(isObjectContained(edge,adjacent) && !isObjectContained(edge,blacklist)) {
				activateAdjacentEdge(edge);
			}

			else if (!isObjectContained(edge,getSelectedEdges())) {
				deactivateEdge(edge);
			}
		}
	}
	
	if(isHamiltonianCycle()) {
		console.log("Hamiltonian Cycle");
	}
	else if(isHamiltonianPath() && endOfGame()) {
		console.log("Hamiltonian Path");
	}
	else if(endOfGame()) {
		console.log("end of game");
	}

	 
	function isObjectContained(object,list) {
		for(let element of list) {
			if(object==element) {
				return true
			}
		}
		return false
	}
	
	function endOfGame() {
		let end = true;
		let selectedEdges = getSelectedEdges();
		let blacklist = getBlacklist();
		for(let edge of viewer.edges) {
			if(edge.active && !edge.selected) {
					end = false;
				}
			}
			return end;
		}
		
	function getAdjacentEdges(selectedVertex) {
		let edge;
		let adj = [];
		for (let vertex of viewer.vertices) {
			edge = getEdge(selectedVertex,vertex);
			if(edge && !isObjectContained(edge,selectedEdges)) {
				adj.push(edge)
			}
		}
		return adj;
	}
		
		
	function getAdjacentEdgesOld() {
		//returns all adjacent edges that are not selected
		let selectedEdges = getSelectedEdges();
		let adjacentEdges = [];
		for(let selectedEdge of selectedEdges) {
			for(let edge of viewer.edges) {
				if((  edge.abstract.vertices[0]==selectedEdge.abstract.vertices[0]
					||edge.abstract.vertices[0]==selectedEdge.abstract.vertices[1]
					||edge.abstract.vertices[1]==selectedEdge.abstract.vertices[0]
					||edge.abstract.vertices[1]==selectedEdge.abstract.vertices[1])
					&& !edge.selected) {
						adjacentEdges.push(edge);
				}
			}
		}
		return adjacentEdges;
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


	function getAdjacentVertices(selectedVertex) {
		let adjacent = [];
		for (let vertex of viewer.vertices) {
			if(getEdge(vertex, selectedVertex)) {
				adjacent.push(vertex);
			}
		}
		return adjacent;
	}
	
	function getSelectedEdges() {
		//returns all selected edges
		let selectedEdges = [];
		for(let edge of viewer.edges) {
			if(edge.selected) {
				selectedEdges.push(edge);
			}
		}
		return selectedEdges;
	}
    
    function getSelectedVertices() {
		//returns all selected vertices and multiplicity of selectednes
		let selectedEdges = getSelectedEdges();
		let selectedVertices = [];
		for(let i=0;i<selectedEdges.length;i++) {
			for(let j=0;j<viewer.vertices.length;j++) {
				if(viewer.vertices[j].abstract.id==selectedEdges[i].abstract.vertices[0].id
					||viewer.vertices[j].abstract.id==selectedEdges[i].abstract.vertices[1].id) {
						selectedVertices.push(viewer.vertices[j]);
				}
			}
		}
		return selectedVertices;
	}
    
    function getBlacklist() {
		//returns all edges that are incident to a vertex with multiple selectedness 
		let blacklistEdges = [];
		let selectedVertices = getSelectedVertices();
		//for each vertex, check if it is selected >1 time
		let vertex, counter;
		for (let i=0;i<viewer.vertices.length;i++) {
			vertex = viewer.vertices[i];
			counter = 0;
			for (let j=0;j<selectedVertices.length;j++) {
				if(vertex==selectedVertices[j]) {
					counter++;
				}
			}
			//for each of these vertices, find unselected incident edges
			if (counter>1) {
				for (let j=0;j<viewer.edges.length;j++) {
					if ((vertex.abstract==viewer.edges[j].abstract.vertices[0]
						||vertex.abstract==viewer.edges[j].abstract.vertices[1])
						&& !viewer.edges[j].selected) {
							//and put them on the blacklist
							blacklistEdges.push(viewer.edges[j])
					}
				}
			}
		}
		return blacklistEdges;
	}	
     
    function selectObject(listOfObjects) {
		for (let object in listOfObjects) {
			object.select();
		}
	}
	
	function unselectOtherVertices(listOfVertices) {
		let selectedVertices = getSelectedVertices();
		for (let i=0;i<viewer.vertices.length;i++) {
			if(!isObjectContained(viewer.vertices[i],listOfVertices)) {
				viewer.vertices[i].unhighlight();
			}
		}
	
	}
    
    function activateAdjacentObject(object) {
		object.color = '0x0000ff'; //blue	
		object.unhighlight();
		object.active = true;
	}
	
	function colorAdjacentObject(object) {
		object.color = '0x0000ff'; //blue	
		object.unhighlight();
		object.active = false;
	}
    
    function deactivateObject(object) {
		object.color = '0x999999';
		object.unhighlight();
		object.active = false;
	}
	
	function isHamiltonianPath() {
		let selectedVertices = getSelectedVertices();
		let counter = 0;
		for(let i=0;i<viewer.vertices.length;i++)  {
			if(isObjectContained(viewer.vertices[i],selectedVertices)) {
				counter++;
			}
		}
		return counter==viewer.vertices.length;
	}
	
	function isHamiltonianCycle() {
		return getSelectedEdges().length==viewer.vertices.length;
	}
		
    


 });

viewer.onObjectHover(function(object) {
    //console.log(object)
});

