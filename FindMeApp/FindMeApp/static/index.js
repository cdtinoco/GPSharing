var Latitud = document.getElementById("Latitud");
var Longitud = document.getElementById("Longitud");
var Fecha = document.getElementById("Fecha");
var Hora = document.getElementById("Hora");

var mymap = L.map('mapa');
var marker;

const tiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

setInterval("peticion()", 3000);

function peticion(){
	const url = '/data'
	

	const http = new XMLHttpRequest()
	http.open("GET", url);
	http.onreadystatechange = function(){
	 	if(this.readyState == 4 && this.status == 200){
			var resultado = JSON.parse(this.responseText);
			console.log(resultado);
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
    mymap.setView([lat, lng], 13);
    L.tileLayer(tiles, {
        maxZoom: 18,
    }).addTo(mymap);
	
    //var polyline = L.polyline(array, {color: 'red'}).addTo(mymap);
    //mymap.fitBounds(polyline.getBounds());
    marker = L.marker([lat, lng]);
    marker.addTo(mymap);
    marker.on('click', function(){
        getWeather(this.getLatLng().lat, this.getLatLng().lng);
    });
}
