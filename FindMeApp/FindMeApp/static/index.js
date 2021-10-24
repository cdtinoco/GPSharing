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
returnBtn = document.getElementById('returnBtn'),
slider = document.getElementById('position-slider');

var mymap = L.map('mapa');
var marker;
var retMarker;
var latlng = new Array();
var actual = new Array();
var seted = false;
var past = false;
var redline;	//Polilinea roja.
var blueline;	//Polilinea azul.
var polylines = new Array(); //Array de polilineas en general.
var historyArray = new Array();
const tiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  
centerBtn.addEventListener('click', function(e){
	e.preventDefault();

    //Setear Latitud-Longitud.
    if(mymap){
	    mymap.setView([actual[0], actual[1]], mymap.getZoom());
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
				historyArray = data;
				past = true;
				const last = [data[data.length - 1].Latitud, data[data.length - 1].Longitud];
				setHistoryItems(data.length-1, last[0], last[1]);	//Habilitar items.
				//history(data);
				//Separar polilineas por auto.
				var matrix = separatePolylines(data);
				for(var car of matrix){
					createPoly(car.vector, randomColor());
				}

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
	slider.style.display = 'none';
	past = false;
});

slider.addEventListener('change', function(){
	if(mymap){
		if(retMarker){
			mymap.removeLayer(retMarker);
		}
		const index = this.value;
		const lat = historyArray[index].Latitud;
		const lng = historyArray[index].Longitud;
		var diahora = historyArray[index].TimeStamp.split('.')[0];
		diahora = diahora.split('T');
		const dia = diahora[0];
		const hora = diahora[1];

		var texto = `
		<h5><strong>Latitud: </strong>${lat}</h5>
		<br>
		<h5><strong>Longitud: </strong>${lng}</h5>
		<br>
		<h5><strong>Día: </strong>${dia}</h5>
		<br>
		<h5><strong>Hora: </strong>${hora}</h5>
		`;

		retMarker = L.marker([lat, lng]);
		retMarker.addTo(mymap).bindPopup(texto).openPopup();
	}
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

				//Mostrar los resultados.
				var response = limitChars(resultado);	//Limitar las cifras significativas.
				Latitud.innerHTML = response.Latitud;
				Longitud.innerHTML = response.Longitud;
				TimeStamp.innerHTML = response.TimeStamp;

				//Crear el mapa.
				createMap(resultado.Latitud, resultado.Longitud);

				//Crear la polilinea.
				latlng.push([resultado.Latitud, resultado.Longitud]);
				createPoly(latlng, 'red');
			}else{
				//Seguir llenando el vector de polilinea.
			    latlng.push(resultado.Latitud, resultado.Longitud);
			}
		}else{
			console.log("readyState: ", http.readyState);
			console.log("status: ", http.status);
		}
	}
	http.send(null);
}

function randomColor(){
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i=0; i<6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
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
}

function createPoly(vector, color){
	//Polilinea.
	var polyline = L.polyline(vector, {'color': color}).addTo(mymap);
	polylines.push(polyline);

    //Marcador.
	const lat = vector[vector.length - 1][0];
	const lng = vector[vector.length - 1][1];
	const icon = L.divIcon({className: 'my-div-icon',
	html: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-geo-alt-fill marker-div-icon" style="color:${color};" viewBox="0 0 16 16">
	<path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
  </svg>`});
    marker = L.marker([lat, lng], {icon: icon});
    marker.addTo(mymap);
}

function history(data){
	var final = new Array();
	for(var n=0; n<data.length; n++){
		final.push([data[n].Latitud, data[n].Longitud]);
	}
	createPoly(final, "blue");

	//Marcador y última coordenada.
    actual = [last[0], last[1]];
}

function setHistoryItems(tam, lat, lng){
	slider.style.display = 'block';
	slider.setAttribute('max', tam);
	slider.setAttribute('value', tam);

	infoDiv.style.display = 'none';
	externalDiv.style.display = 'flex';

	createMap(lat, lng);	//Crear mapa.
}

function separatePolylines(data){
	var placas = new Array();

	//Registrar las matrices.
	for(var car of data){
		if(!placas.includes(car.Placa)){
			placas.push(car.Placa);
		}
	}
	console.log("PLACAS:");
	console.log(placas);

	var finalArray = new Array();
	for(var placa of placas){
		var temp = new Array();
		for(var car of data){
			if(car.Placa == placa){
				temp.push([car.Latitud, car.Longitud]);
			}
		}
		finalArray.push({'placa': placa, 'vector': temp});
	}

	console.log(finalArray);
	return finalArray;
}

function removeAll(){
	if(mymap){
        if(marker){
            mymap.removeLayer(marker);
        }

        if(polylines){
        	for(var line of polylines){
        		mymap.removeLayer(line);
        	}
        }

        if(polylines){
        	for(var line of polylines){
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