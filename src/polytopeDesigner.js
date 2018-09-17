'use strict';

let container;
let pickedColor = '0xacfd32';
let v, rawData;


function updatePickedColor() {
	$('#colorpicker').farbtastic(function(color) {
		pickedColor = color.replace('#','0x');
    });
}

function switchRotation() {
		v.rotate = !v.rotate
		//change icon of button
		$('i.play_pause').toggleClass("fa-play-circle fa-pause-circle");
}


function resetPolytope() {
	for (let face of v.facets) {
		face.color = face.abstract.color;
		face.defaultColor();
	}
	v.setVisible(v.vertices,true);
	v.setVisible(v.edges,true);
	v.setVisible(v.facets,true);
	var el = document.getElementsByClassName("poly-checkbox");
	for(var i = 0; i < el.length; i++) {
		el[i].checked = true;
	}
}

function savePolytope() {
	//convert to JSON format
	let facets = [];
	let colors = [];
	let ids;
	v.facets.sort(function(a,b) { return a.abstract.id - b.abstract.id });
	
	
	for (let facet of v.facets) {
		colors.push(facet.color!==v.facetColor ? facet.color : null)
		ids = [];
		for (let vertex of facet.abstract.vertices) {
			ids.push(vertex.id)
		}
		facets.push(ids)	
	}
	
	let json = 
		{ 	"vertices": rawData.vertices,
			"edges":	rawData.edges,
			"facets":	facets,
			"colors":	colors 
		}
	
	var url_string = window.location.href; 
	var url = new URL(url_string);
	var id = url.searchParams.get("id");
		
	$.ajax({
		type: "POST",
		url: 'https://www.polytopia.eu/sandbox/viewer/src/change_json.php',
		dataType: 'json',
		data: {functionname: 'change', arguments: [colors, id]},
		success: function(output, textstatus) {
				  console.log(output.error);
			  }
	});
}



function initViewer(data, mobile) {
	rawData = Object.assign({},data);
    let coordinates = createData(data);
    container = document.getElementById("viewer");
    let viewer = new PolytopeViewer(container,mobile);
    v = viewer;
    viewer.rotate=true;
    //add polytope to viewer
    viewer.setPolytope(coordinates.vertices, coordinates.edges, coordinates.facets);
    for(let vertex of viewer.vertices) {
		vertex.active = false 
	}
	
	for(let edge of viewer.edges) {
		edge.active = false
	}
    viewer.selection = false;
    

    viewer.onObjectHover(function(object) {
        viewer.highlightColor = pickedColor;
    });
    
    viewer.onObjectClick(function(object) {
        object.color = pickedColor
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

