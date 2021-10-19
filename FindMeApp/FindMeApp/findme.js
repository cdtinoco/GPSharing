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
<<<<<<< HEAD


//Datagram Socket de recepción
=======
//Datagram Socket de recepción.
>>>>>>> b1a6ab19da535692de1470d381f382218d1d358b
socket.on('message', (msg, rinfo) => {
	console.log(`${msg}`);
	Latitud = msg.toString().split(' ')[1];
	Longitud = msg.toString().split(' ')[3];
	Fecha = msg.toString().split(' ')[5];
	Hora = msg.toString().split(' ')[6];
	Placa = msg.toString().split(' ')[7];
	TimeStamp = Fecha.concat(" "+Hora);
	connection.query('INSERT INTO ubicacion.registroUbi (Latitud, Longitud, TimeStamp, Placa) VALUE ("'+Latitud+'","'+Longitud+'","'+TimeStamp+'","'+Placa+'")', function(error, data, fileds){
		if(error){
			console.log("An error has occured: ", error)
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
	/*var placa = req.query.placa;
	if (placa) {
		
	} else {
		
	}*/
	connection.query('SELECT * FROM registroUbi WHERE idregistroUbi = (SELECT MAX(idregistroUbi) FROM registroUbi)', function(error, data, fileds){
		if(error){
			console.log(error);
		}else{
			console.log(data);
			res.send(data[0]);
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

//FIN
app.listen(app.get('port'), function(){
	console.log("Server listening in port: ", app.get('port'));
});