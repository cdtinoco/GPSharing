package com.example.gpsharing3;
import android.Manifest;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.Handler;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;


import com.google.android.gms.maps.model.LatLng;

import java.sql.Date;
import java.text.SimpleDateFormat;
import java.util.TimeZone;


public class MainActivity extends AppCompatActivity {


    static TextView miub;
    static Button env;
    static EditText ipa;

    private LocationManager locationManager;
    private LocationListener locationListener;
    private final long MIN_TIME = 1000;
    private final long MIN_DIST = 0;
    private LatLng latLng;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        miub = findViewById(R.id.textView3);
        env = findViewById(R.id.button);
        ipa = findViewById(R.id.editTextTextPersonName);

        ActivityCompat.requestPermissions(this, new String[]{
                Manifest.permission.ACCESS_FINE_LOCATION
        }, PackageManager.PERMISSION_GRANTED);


        locationListener= new LocationListener() {
            @Override
            public void onLocationChanged(@NonNull Location location) {
                try {
                    latLng = new LatLng(location.getLatitude(), location.getLongitude());
                    String myLatitude = String.valueOf (location.getLatitude());
                    String myLongitude = String.valueOf(location.getLongitude());
                    long time = location.getTime();
                    SimpleDateFormat sdf = new SimpleDateFormat("HH:mm:ss yyyy-MM-dd");
                    sdf.setTimeZone(TimeZone.getTimeZone("America/Bogota"));
                    String curtime = sdf.format(new Date(time));
                    String msg = "Lat: " + myLatitude + " " + "\nLong: " + myLongitude + " " + "\nTimeStamp: " + curtime;
                    miub.setText(msg);

                }
                catch (Exception e) {
                    e.printStackTrace();
                }

            }


        };
        locationManager = (LocationManager) getSystemService(LOCATION_SERVICE);
        try {
            locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER,MIN_TIME,MIN_DIST,locationListener);
        }
        catch (SecurityException e) {
            ActivityCompat.requestPermissions(this, new String[]{
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
            }, PackageManager.PERMISSION_GRANTED);

            e.printStackTrace();
        }

        env.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {

                ejecutar();
            }
        });


    }

    private void ejecutar(){
        final Handler handler = new Handler();
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                ClientSendUDP clientSend = new ClientSendUDP();
                new Thread(new ClientSendUDP()).start();
                Toast.makeText(MainActivity.this, "¡Ubicación enviada!", Toast.LENGTH_LONG).show();
                handler.postDelayed(this,5000);//se ejecutara cada 5 segundos
            }
        },5000);//empezara a ejecutarse después de 5 segundos
    }
}
