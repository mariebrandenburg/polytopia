'use strict';

let container;

//create viewer
container = document.createElement('div');
document.body.appendChild(container);

function initViewer(data) {
    let coordinates = createData(data);
    
    let viewer = new PolytopeViewer(container);

    //add polytope to viewer
    viewer.setPolytope(data.vertices, data.edges, data.facets);


    for(let i=0;i<viewer.vertices.length;i++) {
        viewer.vertices[i].active = false
    }
    for(let i=0;i<viewer.facets.length;i++) {
        viewer.facets[i].active = false
    }


    viewer.onObjectClick(function(object) {
        let blacklist = getBlacklist();
        let adjacent = getAdjacentEdges();
        let selected = getSelectedEdges();


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
            
        
            
        function getAdjacentEdges() {
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
         
        function selectVertices(listOfVertices) {
            for (let i=0;i<listOfVertices.length;i++) {
                listOfVertices[i].select();
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
        
        function activateAdjacentEdge(edge) {
            edge.color = '0x0000ff'; //blue	
            edge.unhighlight();
            edge.active = true;
        }
        
        function deactivateEdge(edge) {
            edge.color = '0x999999';
            edge.unhighlight();
            edge.active = false;
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
}


$.ajax({
    url: "http://poly.mathematik.de/src/json/data_cube.json",
    dataType: 'json',
    error: function(jqXHR, textStatus, errorThrown){
                    alert(errorThrown);
                }  
}).done(initViewer);
