const Latitud = document.getElementById("Latitud"),
Longitud = document.getElementById("Longitud"),
TimeStamp = document.getElementById("TimeStamp");

const Latitud1 = document.getElementById("Latitud1"),
Longitud1 = document.getElementById("Longitud1"),
TimeStamp1 = document.getElementById("TimeStamp1");

const Latitud2 = document.getElementById("Latitud2"),
Longitud2 = document.getElementById("Longitud2"),
TimeStamp2 = document.getElementById("TimeStamp2");

const dateForm1 = document.getElementById('date1');
const dateForm2 = document.getElementById('date2');

const centerBtn = document.getElementById('centerBtn'),
infoDiv = document.getElementById('infoDiv'),
externalDiv = document.getElementById('external-div'),
historyBtn = document.getElementById('historyBtn'),
returnBtn = document.getElementById('returnBtn');

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

	var date1 = dateForm1.value;
	var date2 = dateForm2.value;
	var http = new XMLHttpRequest();
	http.open('GET', '/history?date1='+date1+'&date2='+date2);
	http.onreadystatechange = function(){
		if(http.readyState == 4 && http.status == 200){
			var response = http.responseText;
			response = JSON.parse(response);
			
			if(response.status == 1){
				var data = response.data;
				past = true;
				infoDiv.style.display = 'none';
				externalDiv.style.display = 'flex';
				history(data);

				var response = limitChars(data[0]);
				Latitud1.innerHTML = response.Latitud;
				Longitud1.innerHTML = response.Longitud;
				TimeStamp1.innerHTML = response.TimeStamp;

				response = limitChars(data[data.length-1]);
				Latitud2.innerHTML = response.Latitud;
				Longitud2.innerHTML = response.Longitud;
				TimeStamp2.innerHTML = response.TimeStamp;
			}else{
				alert(response.message);
			}
		}
	}
	http.send(null);
});

returnBtn.addEventListener('click', function(e){
	e.preventDefault();
	infoDiv.style.display = 'block';
	externalDiv.style.display = 'none';
	past = false;
});

setInterval("peticion()", 3000);


//FUNCTIONS.

function peticion(){
	const url = '/data'
	const http = new XMLHttpRequest()
	http.open("GET", url);
	http.onreadystatechange = function(){
	 	if(this.readyState == 4 && this.status == 200){
			var resultado = JSON.parse(this.responseText);
			if(past == false){
				actual = [resultado.Latitud, resultado.Longitud];

				var response = limitChars(resultado);
				Latitud.innerHTML = response.Latitud;
				Longitud.innerHTML = response.Longitud;
				TimeStamp.innerHTML = response.TimeStamp;
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
	removeAll();	//Borrar todo lo anterior.

	//Habilitar el div.
	infoDiv.style.display = 'none';
	externalDiv.style.display = 'flex';
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
	}

	//Marcador y última coordenada.
    marker = L.marker([data[data.length - 1].Latitud, data[data.length - 1].Longitud]);
    actual = [data[data.length - 1].Latitud, data[data.length - 1].Longitud];
    marker.addTo(mymap);

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

function limitChars(resultado){
	//Limitar los caracteres.
	var txLat = "";
	var txLng = "";
	if (resultado.Latitud.length>=10) {
		for(var n=0; n<10; n++){
			txLat += resultado.Latitud[n];
		}					
	}else{
		txLat = resultado.Latitud;
	}

	if (resultado.Longitud.length>=10) {
		for(var n=0; n<10; n++){
			txLng += resultado.Longitud[n];
		}					
	}else{
		txLng = resultado.Longitud;
	}

	var txTimeStamp = "";
	for(var n=0; n<19; n++){
		txTimeStamp += resultado.TimeStamp[n];
	}

	TSD = txTimeStamp.split("T")[0];
	TST = txTimeStamp.split("T")[1];
	txTS = TSD.concat(" "+TST);
	return {'Latitud': txLat, 'Longitud': txLng, 'TimeStamp': txTS};
}

function restrictDate2(dateForm){
	dateForm2.min = dateForm.value;
}

function restrictDate1(dateForm){
	dateForm1.max = dateForm.value;
}