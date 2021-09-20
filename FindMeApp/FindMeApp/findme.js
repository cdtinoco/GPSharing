const express = require('express');
const app = express();
const mysql = require('mysql');
const dgram = require('dgram');
const socket = dgram.createSocket('udp4');
require('dotenv').config();

//CONFIGURACIÓN.
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.use(express.static('static'));

//Conexión con Base de datos
/*
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
  Hora = msg.toString().split(' ')[5];
  Fecha = msg.toString().split(' ')[6];
  connection.query('INSERT INTO ubicacion.registroUbi (Latitud, Longitud, Fecha, Hora) VALUE ("'+Latitud+'","'+Longitud+'","'+Fecha+'","'+Hora+'")', function(error, data, fileds){
	  if(error){
		  console.log("An error has occured: ", error)
	  }
  });
});  
socket.bind(50000)
*/
//RUTAS.
app.get('/', function(req, res){
	res.render('index');
});

app.get('/data', function(req, res){
	res.send({'Latitud': 53.365567, 'Longitud': -1.460983, 'Fecha': '2021-09-19', 'Hora': '11:54'});
	/*
	connection.query('SELECT * FROM registroUbi WHERE idregistroUbi = (SELECT MAX(idregistroUbi) FROM registroUbi)', function(error, data, fileds){
		if(error){
			console.log(error);
		}else{
			console.log(data);
			res.send(data[0]);
		}
	});
	*/
});

//FIN.
app.listen(app.get('port'), function(){
	console.log("Server listening in port: ", app.get('port'));
});
