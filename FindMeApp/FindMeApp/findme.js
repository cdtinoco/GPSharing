const express = require('express');
const app = express();
const mysql = require('mysql');
const dgram = require('dgram');
const socket = dgram.createSocket('udp4');
const sys = require('child_process');
const moment = require('moment');
var socketAdds = [0, 0];
require('dotenv').config();

//CONFIGURACIÓN.
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
	TimeStamp = Fecha.concat(" "+Hora);
	connection.query(`SELECT * FROM ubicacion.registroPlaca WHERE placa = ${Placa}`, function(error, data, fileds){
		if(error){
			console.log("Ha ocurrido un error al consultar la placa: ", error);
		}else{
			if(data.length == 0){
				connection.query(`INSERT INTO ubicacion.registroPlaca (Placa, Fecha) VALUE ('${Placa}', '${TimeStamp}')`, function(error, data, fields){
					if(error){
						console.log("Ha ocurrido un error al registrar la placa: ", error);
					}
				});
			}
		}
	});
	connection.query('INSERT INTO ubicacion.registroUbi (Latitud, Longitud, TimeStamp, Placa) VALUE ("'+Latitud+'","'+Longitud+'","'+TimeStamp+'","'+Placa+'")', function(error, data, fileds){
		if(error){
			console.log("An error has occured: ", error);
		}
	});
});  
socket.bind(50000)

//RUTAS

app.get('/', function(req, res){
	res.render('index');
});

app.get('/data', function(req, res){
	//INCLUIR PLACA EN LA CONSULTA
	var placa = req.query.placa;
	if (placa) {
		console.log("Entro a placas.");
		connection.query(`SELECT * FROM registroUbi WHERE  Placa = ${Placa} AND idregistroUbi = (SELECT MAX(idregistroUbi) FROM registroUbi)`, function(error, data, fileds){
			if(error){
				console.log(error);
			}else{
				console.log(data);
				res.send(data[0]);
			}
		});
	}else{
		console.log("Entro a NO placas.");
		connection.query(`SELECT * FROM ubicacion.registroPlaca`, function(error, data, fields){
			if(error){
				console.log("Error en consulta de varias placas: ", error);
			}else{
				console.log("Esto es DATA:");
				console.log(data);
				var registrosArray = new Array();
				var cont = 0;
				for(var placa of data){
					var number = placa.NuevaPlaca;
					getOneCar(number).then(function(response){
						registrosArray.push(response);
						if(cont < data.length - 1){
							cont++;
						}else{
							console.log("TOTAL DE LA CONSULTA...");
							console.log(registrosArray);
							res.send(registrosArray);
						}
					});	
				}		
			}
		});
	}
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


//FIN.
app.listen(app.get('port'), function(){
	console.log("Server listening in port: ", app.get('port'));
});