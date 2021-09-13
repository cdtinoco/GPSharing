const express = require('express');
const app = express();
const mysql = require('mysql');

//CONFIGURACIÓN.
app.set('port', process.env.PORT || 8080);
app.set('view engine', 'ejs');
app.use(express.static('static'));

const connection = mysql.createConnection({
	host: 'localhost',
	database: 'ubicación',
	user: 'root',
	password: 'J_apantojag99'
});

connection.connect(function(error){
	if(error){
		console.log(error);
	}else{
		console.log("Connection created successfully.");
	}
});

//RUTAS.
app.get('/', function(req, res){
	res.render('index');
});

app.get('/data', function(req, res){
	connection.query('SELECT * FROM ubicación.registroubi WHERE idregistroUbi = (SELECT MAX(idregistroUbi) FROM ubicación.registroubi)', function(error, data, fileds){
		if(error){
			console.log(error);
		}else{
			console.log(data);
			res.send(data[0]);
		}
	});
});

//FIN.
app.listen(app.get('port'), function(){
	console.log("Server listening in port: ", app.get('port'));
});