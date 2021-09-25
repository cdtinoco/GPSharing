const express = require('express');
const app = express();
const mysql = require('mysql');
const dgram = require('dgram');
const socket = dgram.createSocket('udp4');
const sys = require('child_process');
const moment = require('moment');
require('dotenv').config();

//CONFIGURACIÓN.
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.use(express.static('static'));

//Conexión con base de datos
const 	connection = mysql.createConnection({
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
  connection.query('INSERT INTO ubicacion.registroUbi (Latitud, Longitud, Fecha, Hora) VALUE ("'+Latitud+'","'+Longitud+'","'+Fecha+'","'+Hora+'")', function(error, data, fileds){
	  if(error){
		  console.log("An error has occured: ", error)
	  }
  });
});  
socket.bind(50000)

//RUTAS.

app.get('/', function(req, res){
	res.render('index');
});

app.get('/data', function(req, res){
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

	var day1 = moment(date1).format('YYYY-MM-DD');
	var hour1 = moment(date1).format('HH:mm');
	var day2 = moment(date2).format('YYYY-MM-DD');
	var hour2 = moment(date2).format('HH:mm');

	console.log(day1);
	console.log(day2);
	
	connection.query(`SELECT * FROM registroUbi WHERE Fecha BETWEEN '${day1}' AND '${day2}' WHERE Hora BETWEEN '{hour1}' AND '{hour2}'`, function(error, data, fileds){
		if(error){
			console.log(error);
		}else{
			console.log(data);
			res.send(data[0]);
		}
	});
});

app.post('/autopull', function(req, res){
	console.log(sys.exec("cd /home/ubuntu/projects/GPSharing && git reset --hard && git pull").exitCode);
	console.log("recibido")
});

//FIN.
app.listen(app.get('port'), function(){
	console.log("Server listening in port: ", app.get('port'));
});
