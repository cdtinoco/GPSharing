
var Latitud = document.getElementById("Latitud");
var Longitud = document.getElementById("Longitud");
//var Fecha = document.getElementById("Fecha");
//var Hora = document.getElementById("Hora");
const centerBtn = document.getElementById('centerBtn');
const infoDiv = document.getElementById('infoDiv');
const historyBtn = document.getElementById('historyBtn');
const returnBtn = document.getElementById('returnBtn');

var mymap = L.map('mapa');
var marker;
var latlng = new Array();
var actual = new Array();
var seted = false;
var past = false;
var redline;
var blueline;
var redPolilines = new Array();
var bluePolilines = new Array();
const tiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'; 
  
centerBtn.addEventListener('click', function(e){
	e.preventDefault();

    //Setear Latitud-Longitud.
    if(mymap){
	    mymap.setView([actual[0], actual[1]], 13);
	    L.tileLayer(tiles, {
	        maxZoom: 18,
	    }).addTo(mymap);
	    seted = true;
    }
});

historyBtn.addEventListener('click', function(e){
	e.preventDefault();

	const date1 = document.getElementById('date1').value;
	const date2 = document.getElementById('date2').value;

	var http = new XMLHttpRequest();
	http.open('GET', '/history?date1='+date1+'&date2='+date2);
	http.onreadystatechange = function(){
		if(http.readyState == 4 && http.status == 200){
			var data = http.responseText;
			data = JSON.parse(data);
			if(data){
				past = true;
				history(data);
			}else{
				alert("Parece que no hay datos en este rango de fecha.");
			}
		}
	}
	http.send(null);
});

returnBtn.addEventListener('click', function(e){
	e.preventDefault();
	past = false;
});

setInterval("peticion()", 3000);

function peticion(){
	const url = '/data'
	const http = new XMLHttpRequest()
	http.open("GET", url);
	http.onreadystatechange = function(){
	 	if(this.readyState == 4 && this.status == 200){
			var resultado = JSON.parse(this.responseText);
			if(past == false){
				actual = [resultado.Latitud, resultado.Longitud];
				Latitud.innerHTML = resultado.Latitud;
				Longitud.innerHTML= resultado.Longitud;
				//Limitar los caracteres.
				//var txDate = "";
				var txLat = "";
				var txLng = "";
				for(var n=0; n<10; n++){
					//txDate += resultado.Fecha[n];
					txLat += resultado.Latitud[n];
					txLng += resultado.Longitud[n];
				}
				
				//Fecha.innerHTML = txDate;
				Latitud.innerHTML = txLat;
				Longitud.innerHTML = txLng;
				//Hora.innerHTML = resultado.Hora;
				createMap(resultado.Latitud, resultado.Longitud);	
			}else{
				//Seguir llenando el vector de polilinea.
			    var temp = [resultado.Latitud, resultado.Longitud];
			    latlng.push(temp);
			}
		}else{
			console.log("readyState: ", http.readyState);
			console.log("status: ", http.status);
		}
	}
	http.send(null);
}

function createMap(lat, lng){
	//Eliminar marcadores anteriores.
    removeAll();
    if(seted == false){
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
    redPolilines.push(polyline);

    //Marcador.
    marker = L.marker([lat, lng]);
    marker.addTo(mymap);
}

function history(data, lat, lng){
	removeAll();

	if(seted == false && lat != null && lng != null){
	    //Setear Latitud-Longitud.
	    mymap.setView([lat, lng], 13);
	    L.tileLayer(tiles, {
	        maxZoom: 18,
	    }).addTo(mymap);
	    seted = true;
    }

	var final = new Array();
	var cont = 0;
	for(var n=0; n<data.length; n++){
		final.push([data[n].Latitud, data[n].Longitud]);
		if(n == data.length - 1){
			//Marcador y última coordenada.
		    marker = L.marker([data[n].Latitud, data[n].Longitud]);
		    actual = [data[n].Latitud, data[n].Longitud];
		    marker.addTo(mymap);
		}
	}
	console.log("Blue:");
	console.log(final);
	var blueline = L.polyline(final, {color: 'blue'}).addTo(mymap);
	bluePolilines.push(blueline);
}

function removeAll(){
	if(mymap){
        if(marker){
            mymap.removeLayer(marker);
        }

        if(redPolilines){
        	for(var line of redPolilines){
        		mymap.removeLayer(line);
        	}
        }

        if(bluePolilines){
        	for(var line of bluePolilines){
        		mymap.removeLayer(line);
        	}
        }
    }
}