var Fecha = document.getElementById("Fecha");
var Hora = document.getElementById("Hora");
const centerBtn = document.getElementById('centerBtn');
var Latitud = document.getElementById("Latitud");
var Longitud = document.getElementById("Longitud");


var mymap = L.map('mapa');
var marker;
var latlng = new Array();
var actual = new Array();
var seted = false;
const tiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'; 
  
centerBtn.addEventListener('click', function(e){
	e.preventDefault();
	seted = false;
	createMap(actual[0][0], actual[0][1]);
});

setInterval("peticion()", 3000);

function peticion(){
	const url = '/data'
	const http = new XMLHttpRequest()
	http.open("GET", url);
	http.onreadystatechange = function(){
	 	if(this.readyState == 4 && this.status == 200){
			var resultado = JSON.parse(this.responseText);
			actual[0] = [resultado.Latitud, resultado.Longitud];
			Latitud.innerHTML = resultado.Latitud;
			Longitud.innerHTML= resultado.Longitud;
			var text = "";
			for(var n=0; n<10; n++){
				text += resultado.Fecha[n];
			}
			Fecha.innerHTML = text;
			Hora.innerHTML = resultado.Hora;
			createMap(resultado.Latitud, resultado.Longitud);
		}else{
			console.log("readyState: ", http.readyState);
			console.log("status: ", http.status);
		}
	}
	http.send(null);
}

function createMap(lat, lng){
	//Eliminar marcadores anteriores.
    if(mymap){
        if(marker){
            mymap.removeLayer(marker);
        }
    }
    if(seted == false){
    	console.log("Hola");
	    //Setear Latitud-Longitud.
	    mymap.setView([lat, lng], 13);
	    L.tileLayer(tiles, {
	        maxZoom: 18,
	    }).addTo(mymap);
	    seted = true;
    }
    
    //Polilinea.
    var temp = [lat, lng];
    latlng.push(temp);
    var polyline = L.polyline(latlng, {color: 'red'}).addTo(mymap);

    //Marcador.
    marker = L.marker([lat, lng]);
    marker.addTo(mymap);
}
