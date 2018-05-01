'use strict'

let PolytopeViewer = function (container) {
    let self = this;
    let objectHoverCallback, objectClickCallback;
    let facetGeometry, facetMesh, facetTable;
    let lastHoveredObject;
    let mouse = new THREE.Vector2();
    let camera, renderer, scene;
    self.rotate = false;
    let vertexObjects, edgeObjects, facetObjects;

    function init() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0x23565e );
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
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

        var light = new THREE.DirectionalLight( 0xffffff, 0.45 );
		light.position.set( 0, 0, -1 );
        scene.add( light );

        var light = new THREE.DirectionalLight( 0xffffff, 0.45);
        light.position.set( 0, 0, 1 );
        scene.add( light );

        var light = new THREE.DirectionalLight( 0xffffff, 0.45 );
		light.position.set( 1, 0, 0 );
        scene.add( light );

        var light = new THREE.DirectionalLight( 0xffffff, 0.45);
        light.position.set( -1, 0, 0 );
        scene.add( light );

        var light = new THREE.DirectionalLight( 0xffffff, 0.45 );
		light.position.set( 0, 1, 0 );
        scene.add( light );

        var light = new THREE.DirectionalLight( 0xffffff, 0.45);
        light.position.set( 0, -1, 0 );
        scene.add( light );

        var light = new THREE.AmbientLight( 0xffffff, 0.6 );
        scene.add( light );

        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mousedown', selectObject, false);
        window.addEventListener( 'resize', onWindowResize, false );
    }
    //--functions to create all the stuff--//
    //create table which groups the 3D-faces by their normal vector
    function makeFacetTable(geometry) {
        let table = [];
        let faces = geometry.faces;
        for (let i = 0; i < faces.length; i++) {
            let face = faces[i];
            let added = false;
            for (let j = 0; j < table.length; j++) {
                if (face.normal.equals(table[j][0].normal)) {
                    table[j].push(face);
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
        let vertexMaterial = new THREE.MeshPhongMaterial({color: 0x999999, shininess: 40});
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
            let edgeMaterial = new THREE.MeshPhongMaterial({color: 0x999999, shininess: 40});
            let edgeMesh = new THREE.Mesh(edgeGeometry,edgeMaterial);
            return edgeMesh;
        }

    //--'get'-methods--//
    function getVertexObject(mesh) {
        for(let i=0;i<vertexObjects.length;i++) {
            if(mesh==vertexObjects[i].mesh){
            return vertexObjects[i]
            }
        }
        return null
    }

    function getEdgeObject(mesh) {
        for(let i=0;i<edgeObjects.length;i++) {
            if(mesh==edgeObjects[i].mesh){
            return edgeObjects[i]
            }
        }
        return null
    }

    function getFacetObject(face) {
        for(let i=0;i<facetObjects.length;i++) {
            for(let j=0;j<facetObjects[i].mesh.length;j++)
            {
                if(facetObjects[i].mesh[j]==face) {
                    return facetObjects[i]
                }
            }
        }
        return null
    }

    //find the corresponding abstract facet to a 3d-face
    function getFacetAbstract(faceMesh,listOfFacetObjects) {

        let face = [facetGeometry.vertices[faceMesh.a],
                    facetGeometry.vertices[faceMesh.b],
                    facetGeometry.vertices[faceMesh.c]]

        for(let i=0;i<listOfFacetObjects.length;i++) {
                if (isFaceContained(face,listOfFacetObjects[i].vertices)) {
                    return listOfFacetObjects[i];
                }
            }
            return null

        function isFaceContained(face,listOfVertexObjects) {
            for (let i=0;i<face.length;i++) {
                if (!isVertexContained(face[i],listOfVertexObjects)) {
                    return false;
                }
            }
            return true;

            function isVertexContained(vertex, listOfVertexObjects) {
                for (let i=0;i<listOfVertexObjects.length;i++) {
                    if(vertex.equals(listOfVertexObjects[i].position)) {
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
    }
    

    //--Selection--//
    function selectObject(event) {
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;
        let object = getHoveredObject();
        if(object){
            if(object.active && object.selected) {
                object.highlight();
                object.selected = false;
                objectClickCallback(object);
            }
            else if (object.active) {
                object.select();
                object.selected = true;
                objectClickCallback(object);
            }
        }
    }


    //--Hovering--//
    function updateObjectHover() {
        let object = getHoveredObject();
        if (hasObjectChanged(object)) {
            if (object && !object.selected && object.active) {
                object.highlight();
                objectHoverCallback(object)
            }
            if (lastHoveredObject && !lastHoveredObject.selected && lastHoveredObject.active) {
                lastHoveredObject.unhighlight();
            }
            lastHoveredObject = object;
        }
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
    

    //--all the big things--//
    function onDocumentMouseMove(event) {
        event.preventDefault();
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;
        updateObjectHover();
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        if (self.rotate && self.polytope) {
            self.polytope.rotation.x += 0.0015;
            self.polytope.rotation.y += 0.001;
            updateObjectHover();
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
            {color: 0xffffff, shininess: 60, vertexColors: THREE.FaceColors}
        );
        facetMesh = new THREE.Mesh(facetGeometry, facetMaterial);
        for(let i=0;i<facetMesh.geometry.faces.length;i++) {
            facetMesh.geometry.faces[i].color.setHex(0x999999);
            facetMesh.geometry.colorsNeedUpdate = true;
        }
        self.polytope.add(facetMesh);

        vertexObjects = [];
        for(let i=0;i<vertices.length;i++) {
            vertexObjects.push(
                {
                    abstract: vertices[i],
                    mesh: createVertexMesh(vertices[i].position),
                    object_type: 'vertex',
                    highlight: function() { this.mesh.material.color.setHex(0xdddddd)},
                    unhighlight: function() { this.mesh.material.color.setHex(this.color) },
                    select: function() { this.mesh.material.color.setRGB(0.6,0,0) },
                    selected: false,
                    active: true,
                    color: '0x999999'
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
                    highlight: function() { this.mesh.material.color.setHex(0xdddddd)},
                    unhighlight: function() { this.mesh.material.color.setHex(this.color) },
                    select: function() { this.mesh.material.color.setRGB(0.6,0,0) },
                    unselect: null,
                    selected: false,
                    active: true,
                    color: '0x999999'
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
                    normal: facetTable[i].normal,
                    highlight: function() {
                        for (let i = 0; i < this.mesh.length; i++) {
                            this.mesh[i].color.setHex(0xdddddd);
                            facetMesh.geometry.colorsNeedUpdate = true;
                        }},
                    unhighlight: function() {
                        for (let i = 0; i < this.mesh.length; i++) {
                            let color = this.abstract.color;
                            this.mesh[i].color.setHex(color);
                            facetMesh.geometry.colorsNeedUpdate = true;
                        }},
                    select: function() {
                        for (let i = 0; i < this.mesh.length; i++) {
                            this.mesh[i].color.setRGB(0.6, 0, 0);
                            facetMesh.geometry.colorsNeedUpdate = true;
                        }},
                    selected: false,
                    active : true,
                }
            )
        }

        //color the faces in preset color
        let color;
        for(let i=0;i<facetObjects.length;i++) {
            color = facetObjects[i].abstract.color;
            for (let j=0;j<facetObjects[i].mesh.length;j++) {
                facetObjects[i].mesh[j].color.setHex(color);
                facetMesh.geometry.colorsNeedUpdate = true;
            }
        }

        self.polytope.scale.set(10, 10, 10);
        scene.add(self.polytope);
        self.facets = facetObjects;
        self.vertices = vertexObjects;
        self.edges = edgeObjects;
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
		for (let i=0;i<listOfObjects.length;i++) {
			listOfObjects[i].mesh.visible = bool
		}
	}
};
