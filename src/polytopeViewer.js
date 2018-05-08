'use strict'
let plane;

function createData(data) {
    let i = 0;
    data.vertices = data.vertices.map(function (pos) {
        return {id: i++, 
				position : new THREE.Vector3(pos[0],pos[1],pos[2])}
    });
    i=0;
    data.edges = data.edges.map(function (id) {
        return {id: i++,
				vertices: [data.vertices[id[0]], data.vertices[id[1]]]}
    });
    i=0;
    data.facets = data.facets.map(function (list) {
        let vertices = [];
        for (let i=0; i<list.length; i++) {
            vertices.push(data.vertices[list[i]]);
        }
        return {id: i++,
				vertices: vertices, 
				color: data.colors[i] ? data.colors[i] : 0x5b4c88 }
    }); 
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
    self.selectionColor = 0xff0000;
    let markColor = 0xe8676a;
    let backgroundColor = 0xffffff;
    let lightsColor = 0xffffff;
    let vertexColor = 0x999999;
    let edgeColor = 0x999999;
    //self.facetColor = 0x156763; //facet color is defined above in createData


    function init() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color( backgroundColor );
        camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);

        renderer = new THREE.WebGLRenderer({antialias: true});
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
                if (face.normal.distanceTo(list[0].normal)<Math.pow(10, -7)) {
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
        let vertexGeometry = new THREE.SphereGeometry(0.05, 32, 32);
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
                    if(vertex.distanceTo(object.position)<Math.pow(10, -7)) {
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
        mouse.x = ( event.clientX / container.clientWidth ) * 2 - 1;
        mouse.y = -( event.clientY / container.clientHeight ) * 2 + 1;
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
        mouse.x = ( event.clientX / container.clientWidth ) * 2 - 1;
        mouse.y = -( event.clientY / container.clientHeight ) * 2 + 1;
        updateObjectHover();
	}
	
	function updateObjectHover() {
			let object = getHoveredObject();
			if (hasObjectChanged(object)) {
				if (object && !object.selected && object.active) {
					objectHoverCallback(object)
					object.highlight();
				}
				if (lastHoveredObject && !lastHoveredObject.selected && lastHoveredObject.active) {
					lastHoveredObject.defaultColor();
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
        render();
        requestAnimationFrame(animate);
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
                    highlight: function() { this.mesh.material.color.setHex(self.highlightColor)},
                    select: function() { this.mesh.material.color.setHex(self.selectionColor) },
                    selected: false,
                    mark: function() { this.mesh.material.color.setHex(self.markColor) },
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


        self.polytope.scale.set(10, 10, 10);
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
};
