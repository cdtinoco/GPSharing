const express = require('express');
const app = express();
const mysql = require('mysql');
const dgram = require('dgram');
const socket = dgram.createSocket('udp4');
const sys = require('child_process');
require('dotenv').config();
//uuuuuu
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
  TS = Fecha.concat(" "+Hora);
  connection.query('INSERT INTO ubicacion.registroUbi (Latitud, Longitud, TimeStamp) VALUE ("'+Latitud+'","'+Longitud+'","'+TS+'")', function(error, data, fileds){
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

app.post('/autopull', function(req, res){
	console.log(sys.exec("cd /home/ubuntu/projects/GPSharing && git reset --hard && git pull").exitCode);
	console.log("recibido")
});

//FIN.
app.listen(app.get('port'), function(){
	console.log("Server listening in port: ", app.get('port'));
});
