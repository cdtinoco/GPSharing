const Latitud = document.getElementById("Latitud"),
Longitud = document.getElementById("Longitud"),
TimeStamp = document.getElementById("TimeStamp"),
RPMdiv = document.getElementById('RPMdiv'),
dataTitle = document.getElementById('display-data-title');

const dateForm1 = document.getElementById('date1');
const dateForm2 = document.getElementById('date2');

const centerBtn = document.getElementById('centerBtn'),
infoDiv = document.getElementById('infoDiv'),
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
var realtimeIndex = 0;
var realtimeArray = new Array();
var realtimePlacas = new Array();
var realtimeRPMs = new Array();
var colors = new Array();

const asideContent = document.getElementById('aside-content');

const tiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

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

				historyIndex = 0;
				
				setHistoryItems(matrix[0].vector.length-1, matrix[0]);	//Habilitar items.
				var color = randomColor();
				historyObject.push({'placa': matrix[0].placa, 'vector': matrix[0].vector, 'timeStamps': matrix[0].timeStamps, 'color': color, 'RPM': matrix[0].RPM});
				createPoly(matrix[0].vector, matrix[0].placa, color, true);	//Crear polilineas.
				for(var i=1; i<matrix.length; i++){
					var item = matrix[i];
					color = randomColor();
					historyObject.push({'placa': item.placa, 'vector': item.vector, 'timeStamps': item.timeStamps, 'color': color, 'RPM': item.RPM});
					createPoly(item.vector, item.placa, color, false);	//Crear polilineas.
				}
				console.log("HISTORY OBJECT");
				console.log(historyObject);
			}else{
				alert(response.message);
			}
		}
	}
	http.send(null);
});

returnBtn.addEventListener('click', function(e){
	e.preventDefault();
	infoDiv.style.background = 'rgba(58, 58, 204, 0.7)';
	dataTitle.innerHTML = "Tiempo Real";
	infoDiv.style.display = 'block';
	slider.style.display = 'none';
	past = false;
	removeAll();
});

slider.addEventListener('change', function(){
	if(mymap){
		if(retMarker){
			mymap.removeLayer(retMarker);
		}
		const index = this.value;
		const lat = historyObject[historyIndex].vector[index][0];
		const lng = historyObject[historyIndex].vector[index][1];
		var diahora = historyObject[historyIndex].timeStamps[index];
		var rpm = historyObject[historyIndex].RPM[index];

		Latitud.innerHTML = lat;
		Longitud.innerHTML = lng;
		TimeStamp.innerHTML = diahora;
		RPMdiv.innerHTML = rpm;

		retMarker = L.marker([lat, lng]).addTo(mymap);
		mymap.panTo(new L.LatLng(lat, lng));
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
				actual = [resultado[realtimeIndex].Latitud, resultado[realtimeIndex].Longitud];

				//Llenar la matrix de locaciones por placa.
				for(var car of resultado){
					var found = false;
					for(var i=0; i<realtimePlacas.length; i++){
						var register = realtimePlacas[i];
						if(register == car.Placa){
							found = true;
							realtimeArray[i].push([car.Latitud, car.Longitud]);
							realtimeRPMs[i].push(car.RPM);
							break;
						}
					}
					if(found == false){
						realtimeArray.push([[car.Latitud, car.Longitud]]);
						realtimePlacas.push(car.Placa);
						realtimeRPMs.push([car.RPM]);
					}
				}
				
				//Crear el mapa.
				createMap(resultado[realtimeIndex].Latitud, resultado[realtimeIndex].Longitud);
				console.log("realtimeIndex: ", realtimeIndex);
				//Crear las polilineas.
				for(var i=0; i<realtimeArray.length; i++){
					var vector = realtimeArray[i];
					createPoly(vector, realtimePlacas[i], '#E62727', (i==realtimeIndex)?true:false);
				}

				asideContent.innerHTML = "";
				for(var i=0; i<realtimePlacas.length; i++){
					var placa = realtimePlacas[i];
					var rpm = realtimeRPMs[i][realtimeRPMs[i].length - 1];
					pushCar(placa, rpm);
				}

				//Mostrar los resultados.
				var response = limitChars(resultado[realtimeIndex]);	//Limitar las cifras significativas.
				Latitud.innerHTML = response.Latitud;
				Longitud.innerHTML = response.Longitud;
				TimeStamp.innerHTML = response.TimeStamp;
				RPMdiv.innerHTML = response.RPM;
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
	var polyline = L.polyline(vector, {'color': selected?color:'gray'}).addTo(mymap);
	polylines.push({'placa': placa, 'color': color, 'object': polyline});

    //Marcador.
	const lat = vector[vector.length - 1][0];
	const lng = vector[vector.length - 1][1];
	const icon = L.divIcon({className: 'my-div-icon',
	html: `	<svg id="${placa}" data-checked=${selected?'1':'0'} data-color="${color}" class="marker-div-icon" viewBox="0 0 16 16" style="color:${selected?color:'gray'}" onclick="clickMarkerEvent(this);">
				<path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
  			</svg>`});
    marker = L.marker([lat, lng], {icon: icon});
    marker.addTo(mymap);
	markers.push(marker);
}

function setHistoryItems(tam, final){
	slider.style.display = 'block';
	slider.setAttribute('max', tam);
	slider.setAttribute('value', tam);

	infoDiv.style.background = 'rgba(16, 243, 64, 0.7)';
	dataTitle.innerHTML = "Históricos";
	console.log("SET HISTORY ITEMS:");
	console.log(final);
	console.log(final.Latitud);
	console.log(final.RPM);
	Latitud.innerHTML = final.vector[final.vector.length - 1][0];
	Longitud.innerHTML = final.vector[final.vector.length - 1][1];
	TimeStamp.innerHTML = final.timeStamps[final.timeStamps.length - 1];
	RPMdiv.innerHTML = final.RPM[final.RPM.length - 1];
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
		var rpm = new Array();
		for(var car of data){
			if(car.Placa == placa){
				temp.push([car.Latitud, car.Longitud]);
				timeTemp.push(car.TimeStamp);
				rpm.push(car.RPM);
			}
		}
		finalArray.push({'placa': placa, 'vector': temp, 'timeStamps': timeTemp, 'RPM':rpm});
	}

	console.log(finalArray);
	return finalArray;
}

function removeAll(){
	if(mymap){
        if(polylines){
        	for(var line of polylines){
        		mymap.removeLayer(line.object);
        	}
        }

        if(markers){
			for(var marker of markers){
				mymap.removeLayer(marker);
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
	var rpm = resultado.RPM;
	return {'Latitud': txLat, 'Longitud': txLng, 'TimeStamp': txTS, 'RPM': rpm};
}

function restrictDate2(dateForm){
	dateForm2.min = dateForm.value;
}

function restrictDate1(dateForm){
	dateForm1.max = dateForm.value;
}


function clickMarkerEvent(item){
	var placa = item.getAttribute('id');
	var color;
	if(past){
		for(var object of historyObject){
			if(object.placa == placa){
				color = object.color;
				break;
			}
		}
	}else{
		color = 'red';
	}
	const divMarkers = document.getElementsByClassName('marker-div-icon');
	realtimeIndex = realtimePlacas.indexOf(placa);

	for(var poly of polylines){
		if(poly.placa == placa){
			poly.object.setStyle({color: color});
			//item.style.color = color;
		}else{
			poly.object.setStyle({color: 'gray'});
		}
	}

	for(var divmarker of divMarkers){
		if(divmarker.getAttribute('id') == placa){
			divmarker.setAttribute('data-checked', '1');
			divmarker.style.color = color;
		}else{
			divmarker.setAttribute('data-checked', '0');
			divmarker.style.color = 'gray';
		}
	}

	if(past){
		for(var i=0; i<historyObject.length; i++){
			if(historyObject[i].placa == placa){
				console.log(historyObject[i]);
				var length = historyObject[i].vector.length - 1;
				var final = historyObject[i];
				setHistoryItems(length, final);
				historyIndex = i;
			}
		}
	}
}

function pushCar(placa, rpm){
	const external = document.createElement('div');
	external.style.width = '100%';
	external.style.display = 'flex';
	external.style.justifyContent = 'space-around';
	external.setAttribute('id', placa);
	external.setAttribute('class', 'side-car-container container-fluid');
	external.setAttribute('onclick', 'selectCar(this)');
	//external.innerHTML = placa;
	external.innerHTML = `
	<div>${placa}</div>
	<div style="color:lightgreen;">${rpm}</div>
	`

	asideContent.appendChild(external);
}

function selectCar(car){
	const placa = car.getAttribute('id');
	if(past == false){
		for(var i=0; i<realtimePlacas.length; i++){
			if(realtimePlacas[i] == placa){
				var coords = realtimeArray[i][realtimeArray[i].length - 1];
				mymap.panTo(new L.LatLng(coords[0], coords[1]));
				break;
			}
		}
	}else{
		for(var object of historyObject){
			if(object.placa == placa){
				var coords = object.vector[object.vector.length - 1];
				mymap.panTo(new L.LatLng(coords[0], coords[1]));
				break;
			}
		}
	}
	clickMarkerEvent(car);
}

/*
	* Reducir el ancho del sidenav.
	* Terminar de testear la página.
	* Intentar arreglar lo del color del marker.
*/