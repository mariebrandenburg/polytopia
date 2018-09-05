'use strict'
let facetColor = 0xacfd32;
function createData(data) {
    let i = 0;
    data.vertices = data.vertices.map(function (pos) {
        return {id: i++, 
		//we reflect the polytope about the xy-plane in order to match the orientation with the orientation of the unfoldings
				position : new THREE.Vector3(pos[0],pos[1],-pos[2])}
    });
    i=0;
    data.edges = data.edges.map(function (id) {
        return {id: i++,
				vertices: [data.vertices[id[0]], data.vertices[id[1]]]}
    });

    let facets = [];
    let id=0;
	for (let facet of data.facets) {
		let vertices = [];
		for (let i=0; i<facet.length; i++) {
            vertices.push(data.vertices[facet[i]]);
        }
		facets.push(
			{ 	id: id,
				vertices: vertices,
				color: data.colors[id] ? data.colors[id] : facetColor
			})
		id++;
	}
	data.facets = facets;
    return data;
}; 


let PolytopeViewer = function (container,mobile) {
    let self = this;
    let objectHoverCallback, objectClickCallback;
    let facetGeometry, facetMesh, facetTable;
    let lastHoveredObject;
    let mouse = new THREE.Vector2();
    let camera, renderer, scene;
    let vertexObjects, edgeObjects, facetObjects;
    let hasMouseMoved = false;
    
    //--Design Area--//
    self.selection = true;
    self.rotate = false;
    self.highlightColor = 0xdddddd;
    self.selectionColor = 0x111e6c;
    self.markColor = 0x75a8ff; //0x6fbbd3;
    let backgroundColor = 0xffffff;
    let lightsColor = 0xffffff;
    let vertexColor = 0x999999;
    let edgeColor = 0x999999;
    self.facetColor = facetColor; //facet color is defined above in createData
    self.vertexSize = 0.05;


    function init() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color( backgroundColor );
        camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);

        renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        camera.position.z = 40;
        camera.position.x = -25;
        camera.position.y = 20;

		let controls = new THREE.OrbitControls( camera, renderer.domElement );
		controls.addEventListener( 'change', render ); // remove when using animation loop
	    // enable animation loop when using damping or autorotation
        //controls.enableDamping = true;
		//controls.dampingFactor = 0.001;
		controls.enableZoom = true;

        var light = new THREE.DirectionalLight( lightsColor, 0.45 );
		light.position.set( 0, 0, -1 );
        scene.add( light );

        var light = new THREE.DirectionalLight(lightsColor, 0.45);
        light.position.set( 0, 0, 1 );
        scene.add( light );

        var light = new THREE.DirectionalLight( lightsColor, 0.45 );
		light.position.set( 1, 0, 0 );
        scene.add( light );

        var light = new THREE.DirectionalLight( lightsColor, 0.45);
        light.position.set( -1, 0, 0 );
        scene.add( light );

        var light = new THREE.DirectionalLight( lightsColor, 0.45 );
		light.position.set( 0, 1, 0 );
        scene.add( light );

        var light = new THREE.DirectionalLight( lightsColor, 0.45);
        light.position.set( 0, -1, 0 );
        scene.add( light );

        var light = new THREE.AmbientLight( lightsColor, 0.6 );
        scene.add( light );
        
        if(!mobile) {
			document.addEventListener('mousemove', onDocumentMouseMove, false)
		};
        document.addEventListener('mousedown', selectObject, false);
        window.addEventListener( 'resize', onWindowResize, false );        
    }
    
    
    //--functions to create all the stuff--//
    //create table which groups the 3D-faces by their normal vector
    function makeFacetTable(geometry) {
        let table = [];
        for (let face of geometry.faces) {
            let added = false;
            for (let list of table) {
                if (face.normal.distanceTo(list[0].normal)<Math.pow(10, -6)) {
                    list.push(face);
                    added = true;
                }
            }
            if (!added) {
                table.push([face])
            }
        }
        return table
    }

    function createVertexMesh(position) {
        let vertexMaterial = new THREE.MeshPhongMaterial({color: vertexColor, shininess: 40});
        let vertexGeometry = new THREE.SphereGeometry(self.vertexSize, 32, 32);
        vertexGeometry.geometryType = 'vertex' ;
        let vertexMesh = new THREE.Mesh(vertexGeometry, vertexMaterial);
        vertexMesh.position.copy(position);
        return vertexMesh
    }

     function createEdgeMesh(edge) {
            let line = new THREE.LineCurve(edge.vertices[0].position,edge.vertices[1].position);
            let edgeGeometry = new THREE.TubeGeometry( line, 20, 0.025, 8, false )
            edgeGeometry.geometryType = 'edge';
            let edgeMaterial = new THREE.MeshPhongMaterial({color: edgeColor, shininess: 40});
            let edgeMesh = new THREE.Mesh(edgeGeometry,edgeMaterial);
            return edgeMesh;
        }


    //--'get'-methods--//

    //find the corresponding abstract facet to a 3d-face
    function getFacetAbstract(faceMesh,listOfAbstractFacets) {
		//get the coordinates of the faceMesh from the geometry
        let face = [facetGeometry.vertices[faceMesh.a],
                    facetGeometry.vertices[faceMesh.b],
                    facetGeometry.vertices[faceMesh.c]]
                    
		//check for each abstact facet if all vertices of the face are contained
        for(let facet of listOfAbstractFacets) {
                if (isFaceContained(face,facet.vertices)) {
                    return facet;
                }
            }
            alert("adjust threshold in getFacetAbstract (isVertexContained)")
            return null

		
        function isFaceContained(face,listOfVertexObjects) {
            for (let vertex of face) {
                if (!isVertexContained(vertex,listOfVertexObjects)) {
                    return false;
                }
            }
            return true;

            function isVertexContained(vertex, listOfVertexObjects) {
                for (let object of listOfVertexObjects) {
                    if(vertex.distanceTo(object.position)<Math.pow(10, -6)) {
                        return true;
                    }
                }
                return false;
            }
        }
    }

    function getHoveredObject() {
        let raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        let intersects = raycaster.intersectObject(self.polytope, true);
        window.intersects_object = intersects;
        if (!intersects.length) {
            return null;
        }
        let intersected_object = intersects[0].object
        if (intersected_object.geometry.geometryType == 'vertex') {
            return getVertexObject(intersected_object)
        } else if (intersected_object.geometry.geometryType == 'edge') {
            return getEdgeObject(intersected_object)
        } else if(intersected_object === facetMesh) {
            return getFacetObject(intersects[0].face)
        }
        
        
		function getVertexObject(mesh) {
			for(let vertex of vertexObjects) {
				if(mesh==vertex.mesh){
				return vertex
				}
			}
			return null
		}

		function getEdgeObject(mesh) {
			for(let edge of edgeObjects) {
				if(mesh==edge.mesh){
				return edge
				}
			}
			return null
		}

		function getFacetObject(face) {
			for(let facet of facetObjects) {
				for(let triangle of facet.mesh)
				{
					if(triangle==face) {
						return facet
					}
				}
			}
			return null
		}
    }
    

    //--Selection--//
    function selectObject(event) {
        mouse.x = ( (event.pageX - $('#viewer').offset().left) / container.clientWidth ) * 2 - 1;
		mouse.y = -( (event.pageY - $('#viewer').offset().top) / container.clientHeight ) * 2 + 1; 
        let object = getHoveredObject();
        if(object){
            if(object.active && object.selected && self.selection) {
                object.highlight();
                object.selected = false;
                objectClickCallback(object);
            }
            else if (object.active && self.selection) {
                object.select();
                object.selected = true;
                objectClickCallback(object);
            }
            else if (object.active) {
				objectClickCallback(object);
			}
        }
    }


    //--Hovering--//
	function onDocumentMouseMove(event) {
		hasMouseMoved = true;
        mouse.x = ( (event.pageX - $('#viewer').offset().left) / container.clientWidth ) * 2 - 1;
		mouse.y = -( (event.pageY - $('#viewer').offset().top) / container.clientHeight ) * 2 + 1; 
        updateObjectHover();
	}
	
	function updateObjectHover() {
			let object = getHoveredObject();

			if (hasObjectChanged(object)) {
				if (object && object.active) {
					if(object && object.active){
						object.hovered = true;
					}
					objectHoverCallback(object)
				}
				if (lastHoveredObject && lastHoveredObject.active) {
					lastHoveredObject.hovered = false;
				}
				lastHoveredObject = object;
			} 

		
			function hasObjectChanged(object) {
				if (object && lastHoveredObject) {
					return object !== lastHoveredObject;
				}
				if (!object && !lastHoveredObject) {
					return false
				}
				return true
			}
		}

    

    //--all the big things--//
    function onWindowResize() {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    function animate() {
        if (self.rotate && self.polytope) {
            self.polytope.rotation.x += 0.0015;
            self.polytope.rotation.y += 0.001;
            if (hasMouseMoved) {updateObjectHover()};
        }
        if(self.polytope) {
			colorObjects();
		}
        render();
        requestAnimationFrame(animate);
    }
    self.draw = animate;
    
    function colorObjects(){
		let objects = self.vertices.concat(self.edges, self.facets)
		for(let object of objects) {
			if(object.hovered) {object.highlight()}
			else if(object.selected) {object.select()}
			else if(object.marked) {object.mark()}
			else {object.defaultColor()}
		}
	}

    function render() {
		renderer.render( scene, camera );
    }

    //creates a 3d-polytope
    self.setPolytope = function (vertices, edges, facets) {
        self.polytope = new THREE.Object3D();

        // convert vertices into threejs format
        let verticesConverted = vertices.map(function (element) {
            return element.position;
        });

        // create objects
        facetGeometry = new THREE.ConvexGeometry(verticesConverted);
        let facetMaterial = new THREE.MeshPhongMaterial(
            {color: 0xffffff, shininess: 60, vertexColors: THREE.FaceColors} //don't change color here
        );
        facetMesh = new THREE.Mesh(facetGeometry, facetMaterial);
        self.polytope.add(facetMesh);

        
        //let helper = new THREE.FaceNormalsHelper( facetMesh, 2, 0x00ff00, 1 );
        //self.polytope.add(helper);

        vertexObjects = [];
        for(let i=0;i<vertices.length;i++) {
            vertexObjects.push(
                {
                    abstract: vertices[i],
                    mesh: createVertexMesh(vertices[i].position),
                    object_type: 'vertex',
                    defaultColor: function() { this.mesh.material.color.setHex(this.color) },
                    hovered: false,
                    highlight: function() { this.mesh.material.color.setHex(self.highlightColor)},
                    select: function() { this.mesh.material.color.setHex(self.selectionColor) },
                    selected: false,
                    mark: function() { this.mesh.material.color.setHex(self.markColor)},
                    marked: false,
                    active: true,
                    color: vertexColor,
                })
            self.polytope.add(vertexObjects[i].mesh)
        }

        edgeObjects = [];
        for(let i=0;i<edges.length;i++) {
            edgeObjects.push(
                {
                    abstract: edges[i],
                    mesh: createEdgeMesh(edges[i]),
                    object_type: 'edge',
                    defaultColor: function() { this.mesh.material.color.setHex(this.color) },
                    hovered: false,
                    highlight: function() { this.mesh.material.color.setHex(self.highlightColor)},
                    select: function() { this.mesh.material.color.setHex(self.selectionColor) },
                    selected: false,
                    mark: function() { this.mesh.material.color.setHex(self.markColor) },
                    marked: false,
                    active: true,
                    color: edgeColor,
                }
            )
            self.polytope.add(edgeObjects[i].mesh)
        }

        facetTable = makeFacetTable(facetGeometry);

        facetObjects = [];
        for(let i=0;i<facetTable.length;i++) {
            facetObjects.push(
                {
                    abstract: getFacetAbstract(facetTable[i][0],facets),
                    mesh: facetTable[i],
                    object_type: 'facet',
                    normal: facetTable[i][0].normal,
                    defaultColor: function() {
                        for (let face of this.mesh) {
                            face.color.setHex(this.color) }
                        facetMesh.geometry.colorsNeedUpdate = true;},
                    hovered: false,
                    highlight: function() {
                        for (let face of this.mesh) {
                            face.color.setHex(self.highlightColor) }
                        facetMesh.geometry.colorsNeedUpdate = true },
                    select: function() {
                        for (let face of this.mesh) {
                            face.color.setHex(self.selectionColor) }
                        facetMesh.geometry.colorsNeedUpdate = true },
                    selected: false,
                    mark: function() {
                        for (let face of this.mesh) {
                            this.mesh[i].color.setHex(self.markColor) }
                        facetMesh.geometry.colorsNeedUpdate = true },                      
                    marked: false,
                    active : true,
                    color: getFacetAbstract(facetTable[i][0],facets).color
                }
            )
        }

        //color the faces in preset color
        for(let facet of facetObjects) {
            for (let face of facet.mesh) {
                face.color.setHex(facet.color);
            } 
        }
        facetMesh.geometry.colorsNeedUpdate = true;


        self.polytope.scale.set(12, 12, 12);
        scene.add(self.polytope);
        self.facets = facetObjects;
        self.vertices = vertexObjects;
        self.edges = edgeObjects;
        self.camera = camera;
        
    };



    init();
    animate();

    //outside functions
    self.onObjectHover = function(callback) {
        objectHoverCallback = callback;
    }

    self.onObjectClick = function(callback) {
        objectClickCallback = callback;
    }
    
	self.switchRotation = function() {
		self.rotate = !self.rotate
		//change icon of button
		$('i.play_pause').toggleClass("fa-play-circle fa-pause-circle");
	}

    self.vertexVisible = function() {
		let isVisible = self.vertices[0].mesh.visible
		self.setVisible(self.vertices,!isVisible)
	}	
	
	self.edgeVisible = function() {
		let isVisible = self.edges[0].mesh.visible
		self.setVisible(self.edges,!isVisible)
	}
	
	self.facetVisible = function() {
		let isVisible = self.polytope.children[0].visible
		self.setVisible(self.facets,!isVisible);
	}
    
    self.setVisible = function(listOfObjects, bool) {
		if (listOfObjects[0].object_type == "facet") {
			self.polytope.children[0].visible = bool
		}
		else if (listOfObjects[0].object_type == "vertex" || listOfObjects[0].object_type == "edge") {
			for (let object of listOfObjects) {
				object.mesh.visible = bool
			}
		}
	}
	
	self.getEdge = function(vertex1,vertex2) {
		//returns edge incident to two vertices
		for (let edge of self.edges) {
			if((edge.abstract.vertices[0]==vertex1.abstract
				&& edge.abstract.vertices[1]==vertex2.abstract)
			|| (edge.abstract.vertices[0]==vertex2.abstract
				&& edge.abstract.vertices[1]==vertex1.abstract)) {
				return edge;
			}
		}
	}
	
	self.isObjectContained = function(object,list) {
		for(let element of list) {
			if(object==element) {
				return true
			}
		}
		return false
	}
	
	
	//--snapshot of renderer--//
	function saveAsImage() {
		let imgData, imgNode;
		try {
			let strMime = "image/jpeg";
			imgData = renderer.domElement.toDataURL(strMime);
			saveFile(imgData.replace(strMime, "image/octet-stream"), "screenshot.jpg");
		} catch (e) {
			console.log(e);
			return;
		}
    }
    self.snap = saveAsImage;

    function saveFile(strData, filename) {
        let link = document.createElement('a');
        if (typeof link.download === 'string') {
            document.body.appendChild(link); //Firefox requires the link to be in the body
            link.download = filename;
            link.href = strData;
            link.click();
            document.body.removeChild(link); //remove the link when done
        } else {
            location.replace(uri);
        }
	}
};

