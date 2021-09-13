package com.example.gpsharing3;

import android.util.Log;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.SocketException;

public class ClientSendUDP implements Runnable {



    @Override
    public void run() {
        try {
            DatagramSocket udpSocket = new DatagramSocket(50000);
            InetAddress serverAddr = InetAddress.getByName(MainActivity.ipa.getText().toString());
            byte[] buf = (MainActivity.miub.getText().toString()).getBytes();
            DatagramPacket packet = new DatagramPacket(buf, buf.length,serverAddr, 50000);
            udpSocket.send(packet);
            udpSocket.close();
        } catch (SocketException e) {
            Log.e("Udp:", "Socket Error:", e);
        } catch (IOException e) {
            Log.e("Udp Send:", "IO Error:", e);
        }
    }
}
