package com.example.gpsharing3;
import android.Manifest;
import android.bluetooth.BluetoothAdapter;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.*;
import android.os.*;
import android.text.TextUtils;
import android.util.Log;
import android.view.View;
import android.widget.*;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;


import com.github.pires.obd.commands.protocol.EchoOffCommand;
import com.google.android.gms.maps.model.LatLng;

import java.io.IOException;
import java.sql.Date;
import java.text.SimpleDateFormat;
import java.util.*;
import com.github.pires.obd.commands.protocol.LineFeedOffCommand;
import com.github.pires.obd.commands.protocol.SelectProtocolCommand;
import com.github.pires.obd.commands.protocol.TimeoutCommand;
import com.github.pires.obd.enums.ObdProtocols;
import com.github.pires.obd.commands.engine.RPMCommand;

import org.w3c.dom.Text;

public class MainActivity extends AppCompatActivity {

    static TextView miub;
    static TextView miubapp;
    static Button env;
    static EditText letp;
    static EditText nump;
    static Button con;

    private LocationManager locationManager;
    private LocationListener locationListener;
    private String deviceAddress;
    private final long MIN_TIME = 1000;
    private final long MIN_DIST = 0;
    private LatLng latLng;
    private BluetoothSocket socket = null;
    private RPMCommand  engineRpmCommand;
    private static final long SCAN_PERIOD = 10000;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        ActivityCompat.requestPermissions(this, new String[]{
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
        }, PackageManager.PERMISSION_GRANTED);

        miubapp = findViewById(R.id.textView3);
        miub=findViewById(R.id.textView7);
        env = findViewById(R.id.button);
        con = findViewById(R.id.button2);
        letp = findViewById(R.id.editTextTextPersonName3);
        nump = findViewById(R.id.editTextNumber);



        ActivityCompat.requestPermissions(this, new String[]{
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.BLUETOOTH_CONNECT,
                Manifest.permission.BLUETOOTH
        }, PackageManager.PERMISSION_GRANTED);

        //Buscar el adaptador por defecto del dispositivo
        //Verificar que el dispositivo sea compatible con bluetooth
        BluetoothAdapter btAdapter = BluetoothAdapter.getDefaultAdapter();
        if (btAdapter == null) {
            //Verifica
            Toast.makeText(MainActivity.this, "¡El dispositivo no es compatible con bluetooth!", Toast.LENGTH_LONG).show();
        }
        /*if (!btAdapter.isEnabled()) {
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivityForResult(enableBtIntent, 1);
        }*/

        locationListener = new LocationListener() {
            @Override
            public void onLocationChanged(@NonNull Location location) {

                try {
                    engineRpmCommand = null;
                    latLng = new LatLng(location.getLatitude(), location.getLongitude());
                    String myLatitude = String.valueOf(location.getLatitude());
                    String myLongitude = String.valueOf(location.getLongitude());
                    long time = location.getTime();
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    sdf.setTimeZone(TimeZone.getTimeZone("America/Bogota"));
                    String curtime = sdf.format(new Date(time));
                    String msg = "Latitud: " + myLatitude + " " + "\nLongitud: " + myLongitude + " "
                            + "\nTimeStamp: " + curtime + " " + "\nRPM: NA";
                    String msgapp = "Latitud: " + myLatitude + " " + "\nLongitud: " + myLongitude + " "
                            + "\nTimeStamp: " + curtime;
                    miubapp.setText(msgapp);
                    miub.setText(msg);

                }
                catch (Exception e) {
                    e.printStackTrace();
                }


                if (socket != null){

                    if (socket.isConnected()) {
                        try {
                            if (engineRpmCommand != null) {
                                engineRpmCommand.run(socket.getInputStream(), socket.getOutputStream());
                            }
                        } catch (IOException e) {
                            e.printStackTrace();
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }

                        try {
                            latLng = new LatLng(location.getLatitude(), location.getLongitude());
                            String myLatitude = String.valueOf(location.getLatitude());
                            String myLongitude = String.valueOf(location.getLongitude());
                            long time = location.getTime();
                            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                            sdf.setTimeZone(TimeZone.getTimeZone("America/Bogota"));
                            String curtime = sdf.format(new Date(time));
                            String msg = "Latitud: " + myLatitude + " " + "\nLongitud: " + myLongitude + " "
                                    + "\nTimeStamp: " + curtime + " " + "\nRPM: " + engineRpmCommand.getFormattedResult();
                            String msgapp = "Latitud: " + myLatitude + " " + "\nLongitud: " + myLongitude + " "
                                    + "\nTimeStamp: " + curtime + " " + "\nRPM: " + engineRpmCommand.getFormattedResult();
                            miubapp.setText(msgapp);
                            miub.setText(msg);

                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    } else
                        Toast.makeText(MainActivity.this, "OBD desconectado.", Toast.LENGTH_SHORT).show();
                }

            }
        };

        locationManager = (LocationManager) getSystemService(LOCATION_SERVICE);
        try {
            locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, MIN_TIME, MIN_DIST, locationListener);
            //locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, MIN_TIME, MIN_DIST, locationListener);
        } catch (SecurityException e) {
            ActivityCompat.requestPermissions(this, new String[]{
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
            }, PackageManager.PERMISSION_GRANTED);

            e.printStackTrace();
        }

        con.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {

                //Solicitar habilitación de BT
                if (!btAdapter.isEnabled()) {
                    Toast.makeText(MainActivity.this, "Debe activar Bluetooth.", Toast.LENGTH_LONG).show();
                }
                else {
                    ArrayList deviceStrs = new ArrayList();
                    final ArrayList devices = new ArrayList();

                    Set<BluetoothDevice> pairedDevices = btAdapter.getBondedDevices();
                    if (pairedDevices.size() > 0) {
                        for (BluetoothDevice device : pairedDevices) {
                            deviceStrs.add(device.getName() + "\n" + device.getAddress());
                            devices.add(device.getAddress());
                        }
                    }

                    // show list
                    final AlertDialog.Builder alertDialog = new AlertDialog.Builder(MainActivity.this);

                    ArrayAdapter adapter = new ArrayAdapter(MainActivity.this, android.R.layout.select_dialog_singlechoice,
                            deviceStrs.toArray(new String[deviceStrs.size()]));
                    alertDialog.setSingleChoiceItems(adapter, -1, new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            dialog.dismiss();
                            int position = ((AlertDialog) dialog).getListView().getCheckedItemPosition();
                            deviceAddress = (String) devices.get(position);

                            // TODO save deviceAddress

                            BluetoothDevice device = btAdapter.getRemoteDevice(deviceAddress);
                            device.fetchUuidsWithSdp();
                            ParcelUuid[] uuids = device.getUuids();
                            for (ParcelUuid uuid : uuids) {
                                Log.e("uuid: ", uuid.getUuid().toString());
                            }

                            String letplaca = letp.getText().toString();
                            String numplaca = nump.getText().toString();

                            if (letplaca.length() < 3 || numplaca.length() < 3) {
                                Log.e("estado: ", "mal");
                            } else
                                Log.e("estado: ", "todo bn");


                            UUID uuid = UUID.fromString("00001101-0000-1000-8000-00805f9b34fb");

                            try {
                                Log.i("creacion", "creando socket");
                                socket = device.createRfcommSocketToServiceRecord(uuid);
                                Log.i("creado", "socket creado");
                                try {
                                    socket.connect();
                                } catch (IOException e) {
                                    Toast.makeText(MainActivity.this, "No se estableció conexión con el OBD.", Toast.LENGTH_SHORT).show();
                                    Toast.makeText(MainActivity.this, "Verifique que el OBD esté encendido.", Toast.LENGTH_SHORT).show();
                                }
                                Log.i("conexion", "socket conectado");

                                if (socket.isConnected()) {
                                    Toast.makeText(MainActivity.this, "¡OBD conectado!", Toast.LENGTH_LONG).show();
                                }

                                new EchoOffCommand().run(socket.getInputStream(), socket.getOutputStream());
                                new LineFeedOffCommand().run(socket.getInputStream(), socket.getOutputStream());
                                new TimeoutCommand(125).run(socket.getInputStream(), socket.getOutputStream());
                                new SelectProtocolCommand(ObdProtocols.AUTO).run(socket.getInputStream(), socket.getOutputStream());
                                Toast toastsucc1 = Toast.makeText(getApplicationContext(), "Entre1", Toast.LENGTH_SHORT);

                                engineRpmCommand = new RPMCommand();
                                engineRpmCommand.run(socket.getInputStream(), socket.getOutputStream());
                            } catch (Exception e) {
                                Toast toasteror3 = Toast.makeText(getApplicationContext(), "No entre 3", Toast.LENGTH_SHORT);
                                e.printStackTrace();
                            }
                        }
                    });
                    alertDialog.setTitle("Escoja el dispositivo Bluetooth \"OBD\"");
                    alertDialog.show();
                }
            }
        });




        env.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (miubapp.getText().toString().length() == 3){
                    Toast.makeText(MainActivity.this, "Espere a que la ubicación sea visible en la app...", Toast.LENGTH_LONG).show();
                }
                else if (socket == null || !socket.isConnected()){
                    Toast.makeText(MainActivity.this, "Iniciando envío sin conexión con OBD...", Toast.LENGTH_LONG).show();
                    ejecutar_env();
                }
                else if (socket != null && socket.isConnected()){
                    Toast.makeText(MainActivity.this, "Iniciando envío con conexión con OBD...", Toast.LENGTH_LONG).show();
                    ejecutar_env();
                }
            }
        });
    }

    private void ejecutar_env(){
        final Handler handler = new Handler();
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {

                String letplaca = letp.getText().toString();
                String numplaca = nump.getText().toString();

                if (letplaca.length() < 3 || numplaca.length() < 3 ){
                    Toast.makeText(MainActivity.this, "Ingrese un número de placa válido.", Toast.LENGTH_LONG).show();
                }
                else {
                    ClientSendUDP clientSend = new ClientSendUDP();
                    new Thread(new ClientSendUDP()).start();
                    Toast.makeText(MainActivity.this, "¡Ubicación enviada!", Toast.LENGTH_LONG).show();
                    handler.postDelayed(this, 5000);//se ejecutara cada 5 segundos
                }


            }
        },5000);//empezara a ejecutarse después de 5 segundos
    }
}
