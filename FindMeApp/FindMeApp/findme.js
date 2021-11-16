const express = require('express');
const app = express();
const mysql = require('mysql');
const dgram = require('dgram');
const socket = dgram.createSocket('udp4');
const sys = require('child_process');
const moment = require('moment');
var socketAdds = [0, 0];
require('dotenv').config();

//CONFIGURACIÓN
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.use(express.static('static'));

//Conexión con base de datos
const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD
});

connection.connect(function(error){
	if(error){
		console.log(error);
	}else{
		console.log("Connection created successfully.");
	}
});

//Datagram Socket de recepción.
socket.on('message', (msg, rinfo) => {
	console.log(`${msg}`);
	Latitud = msg.toString().split(' ')[1];
	Longitud = msg.toString().split(' ')[3];
	Fecha = msg.toString().split(' ')[5];
	Hora = msg.toString().split(' ')[6];
	Placa = msg.toString().split(' ')[7];
	rpm = msg.toString().split(' ')[8];
	TimeStamp = Fecha.concat(" "+Hora);
	connection.query(`SELECT * FROM ubicacion.registroPlaca WHERE NuevaPlaca = '${Placa}'`, function(error, data){
		if(error){
			console.log("Error adding in registroPlaca: ", error);
		}else{
			if(data.length == 0){

				connection.query(`INSERT INTO ubicacion.registroPlaca (NuevaPlaca, FechaRegistro) VALUE ('${Placa}', '${TimeStamp}')`);
			}
		}
	});
	connection.query('INSERT INTO ubicacion.registroUbi (Latitud, Longitud, TimeStamp, Placa, RPM) VALUE ("'+Latitud+'","'+Longitud+'","'+TimeStamp+'","'+Placa+'","'+rpm+'")');
});
socket.bind(50000)

//RUTAS

app.get('/', function(req, res){
	res.render('index');
});

app.get('/data', function(req, res){
	connection.query(`SELECT * FROM ubicacion.registroPlaca`, function(error, placas, fields){
		if(error){
			console.log("Error during query to registroPlacas: ", error);
		}else{
			console.log("DATA:")
			console.log(placas)
			var data = new Array();
			for(var placa of placas){
				data.push(placa.NuevaPlaca);
			}
			var cont = 0;
			var finalArray = new Array();
			for(var i=0; i<data.length; i++){
				getOneCar(data[i]).then(function(response){
					finalArray.push(response);
					if(cont == data.length - 1){
						console.log("GET ONE CAR:");
						console.log(finalArray);
						res.send(finalArray);
					}else{
						cont++;
					}
				});
			}
		}
	});
	
});

app.get('/history', function(req, res){
	var date1 = req.query.date1;
	var date2 = req.query.date2;
	

	var day1 = moment(date1).format('YYYY-MM-DD HH:mm');
	var day2 = moment(date2).format('YYYY-MM-DD HH:mm');

	console.log(day1);
	console.log(day2);
	
	connection.query("SELECT * FROM registroUbi WHERE TimeStamp BETWEEN '"+day1+"' AND '"+day2+"'", function(error, data, fileds){
		if(error){
			console.log(error);
		}else{
			console.log(data);
			if(data.length > 0){
				res.send({'status': 1, 'data': data});
			}else{
				res.send({'status': 0, 'message': 'No se encontraron registros en este rango de fechas.'});
			}
		}
	});
});

app.post('/autopull', function(req, res){
	console.log(sys.exec("cd /home/ubuntu/projects/GPSharing && git reset --hard && git pull").exitCode);
	console.log("recibido")
});

//FUNCIONES.
function getOneCar(placa){
	return new Promise(function(resolve, reject){
		connection.query(`SELECT * FROM ubicacion.registroUbi WHERE idregistroUbi = (SELECT MAX(idregistroUbi) FROM ubicacion.registroUbi WHERE Placa = '${placa}')`, function(error, data, fields){
			if(error){
				console.log("Error in query: ", error);
			}else{
				resolve(data[0]);
			}
		});
	});
}

app.listen(app.get('port'), function(){
	console.log("Server listening in port: ", app.get('port'));
});