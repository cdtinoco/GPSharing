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
var markers = new Array();
var latlng = new Array();
var actual = new Array();
var seted = false;
var past = false;
var polylines = new Array(); //Array de polilineas en general.
var historyObject = new Array();
var historyIndex = 0;
var realtimeIndex = 1;
var realtimeArray = new Array();
var realtimePlacas = new Array();
const tiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
/*
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
*/

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
				const first = [data[0].Latitud, data[0].Longitud];
				createMap(first[0], first[1]);	//Crear mapa.

				//Separar polilineas por auto.
				var matrix = separatePolylines(data);

				historyObject = [];	//Borrar el objeto de históricos.
				for(var item of matrix){	//Llenar nuevamente el objeto de históricos.
					historyObject.push({'placa': item.placa, 'vector': item.vector, 'timeStamps': item.timeStamps});
				}
				historyIndex = 0;
				
				setHistoryItems(matrix[0].vector.length-1, data[0], data[data.length - 1]);	//Habilitar items.

				createPoly(matrix[0].vector, matrix[0].placa, randomColor(), true);	//Crear polilineas.
				for(var i=1; i<matrix.length; i++){
					var car = matrix[i];
					createPoly(car.vector, car.placa, randomColor(), false);	//Crear polilineas.
				}
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
		const lat = historyObject[historyIndex].vector[index][0];
		const lng = historyObject[historyIndex].vector[index][1];
		var diahora = historyObject[historyIndex].timeStamps[index].split('.')[0];
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
				actual = [resultado[0].Latitud, resultado[0].Longitud];

				//Llenar la matrix de locaciones por placa.
				for(var car of resultado){
					var found = false;
					for(var i=0; i<realtimePlacas.length; i++){
						var register = realtimePlacas[i];
						if(register == car.Placa){
							found = true;
							realtimeArray[i].push([car.Latitud, car.Longitud]);
							break;
						}
					}
					if(found == false){
						realtimeArray.push([[car.Latitud, car.Longitud]]);
						realtimePlacas.push(car.Placa);
					}
				}
				
				//Crear el mapa.
				createMap(resultado[0].Latitud, resultado[0].Longitud);

				//Crear las polilineas.
				for(var i=0; i<realtimeArray.length; i++){
					var vector = realtimeArray[i];
					createPoly(vector, realtimePlacas[i], '#E62727', (i==realtimeIndex)?true:false);
				}

				//Mostrar los resultados.
				var response = limitChars(resultado[realtimeIndex]);	//Limitar las cifras significativas.
				Latitud.innerHTML = response.Latitud;
				Longitud.innerHTML = response.Longitud;
				TimeStamp.innerHTML = response.TimeStamp;
			}else{
				//Seguir llenando el vector de polilinea.
			    //Llenar la matrix de locaciones por placa.
				for(var car of resultado){
					var found = false;
					for(var i=0; i<realtimePlacas.length; i++){
						var register = realtimePlacas[i];
						if(register == car.Placa){
							found = true;
							realtimeArray[i].push([car.Latitud, car.Longitud]);
							break;
						}
					}
					if(found == false){
						realtimeArray.push([[car.Latitud, car.Longitud]]);
						realtimePlacas.push(car.Placa);
					}
				}
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

function createPoly(vector, placa, color, selected){
	//Polilinea.
	var polyline = L.polyline(vector, {'color': color, opacity: selected?1.0:0.6}).addTo(mymap);
	polylines.push({'placa': placa, 'color': color, 'object': polyline});

    //Marcador.
	const lat = vector[vector.length - 1][0];
	const lng = vector[vector.length - 1][1];
	const icon = L.divIcon({className: 'my-div-icon',
	html: `	<svg id="${placa}" fill="currentColor" data-color="${color}" class="marker-div-icon ${selected?'selected-marker':'non-selected-marker'}" style="color: ${color}" viewBox="0 0 16 16" onclick="clickMarkerEvent(this);">
				<path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
  			</svg>`});
    marker = L.marker([lat, lng], {icon: icon});
    marker.addTo(mymap);
	markers.push(marker);
}

function setHistoryItems(tam, init, final){
	slider.style.display = 'block';
	slider.setAttribute('max', tam);
	slider.setAttribute('value', tam);

	infoDiv.style.display = 'none';
	externalDiv.style.display = 'flex';

	Latitud1.innerHTML = init.Latitud;
	Longitud1.innerHTML = init.Longitud;
	TimeStamp1.innerHTML = init.TimeStamp;

	Latitud2.innerHTML = final.Latitud;
	Longitud2.innerHTML = final.Longitud;
	TimeStamp2.innerHTML = final.TimeStamp;
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
		var timeTemp = new Array();
		for(var car of data){
			if(car.Placa == placa){
				temp.push([car.Latitud, car.Longitud]);
				timeTemp.push(car.TimeStamp);
			}
		}
		finalArray.push({'placa': placa, 'vector': temp, 'timeStamps': timeTemp});
	}

	console.log(finalArray);
	return finalArray;
}

function removeAll(){
	if(mymap){
        if(polylines){
        	for(var line of polylines){
        		mymap.removeLayer(line);
        	}
        }

        if(markers){
			for(var line of markers){
				mymap.removeLayer(line);
			}
		}

		polylines = [];
		markers = [];
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

function clickMarkerEvent(item){
	var placa = item.getAttribute('id');
	const divMarkers = document.getElementsByClassName('marker-div-icon');
	realtimeIndex = realtimePlacas.indexOf(placa);

	for(var poly of polylines){
		if(poly.placa == placa){
			const color = poly.color;
			poly.object.setStyle({color: color, opacity: 1.0});
			//item.style.color = color;
		}else{
			poly.object.setStyle({opacity: 0.6});
		}
	}

	for(var divmarker of divMarkers){
		if(divmarker.getAttribute('id') == placa){
			const color = divmarker.getAttribute('data-color');
			if(!divmarker.classList.contains('selected-marker')){
				divmarker.classList.remove('non-selected-marker');
				divmarker.classList.add('selected-marker');
			}
		}else{
			if(divmarker.classList.contains('selected-marker')){
				divmarker.classList.remove('selected-marker');
				divmarker.classList.add('non-selected-marker');
			}
		}
	}

	if(past){
		for(var i=0; i<historyObject.length; i++){
			if(historyObject[i].placa == placa){
				console.log(historyObject[i]);
				var length = historyObject[i].vector.length - 1;
				var initial = {'Latitud': historyObject[i].vector[0][0], 'Longitud': historyObject[i].vector[0][1], 'TimeStamp': historyObject[i].timeStamps[0]};
				var final = {'Latitud': historyObject[i].vector[length][0], 'Longitud': historyObject[i].vector[length][1], 'TimeStamp': historyObject[i].timeStamps[length]};
				setHistoryItems(length, initial, final);
				historyIndex = i;
			}
		}
	}
}