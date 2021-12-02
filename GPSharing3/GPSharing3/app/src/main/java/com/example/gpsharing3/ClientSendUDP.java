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
            InetAddress serverAddr = InetAddress.getByName("13.58.169.143");
            InetAddress serverAddr2 = InetAddress.getByName("52.22.89.135");
            InetAddress serverAddr3 = InetAddress.getByName("3.139.122.213");
            InetAddress serverAddr4 = InetAddress.getByName("3.136.138.86");
            InetAddress serverAddr5 = InetAddress.getByName("18.190.106.33");
            String data = MainActivity.miub.getText().toString() + " " +
                    MainActivity.letp.getText().toString().toUpperCase() +
                    MainActivity.nump.getText().toString();
            byte[] buf = data.getBytes();
            DatagramPacket packet = new DatagramPacket(buf, buf.length,serverAddr, 50000);
            DatagramPacket packet2 = new DatagramPacket(buf, buf.length,serverAddr2, 50000);
            DatagramPacket packet3 = new DatagramPacket(buf, buf.length,serverAddr3, 50000);
            DatagramPacket packet4 = new DatagramPacket(buf, buf.length,serverAddr4, 50000);
            DatagramPacket packet5 = new DatagramPacket(buf, buf.length,serverAddr5, 50000);
            udpSocket.send(packet);
            udpSocket.send(packet2);
            udpSocket.send(packet3);
            udpSocket.send(packet4);
            udpSocket.send(packet5);
            udpSocket.close();
        } catch (SocketException e) {
            Log.e("Udp:", "Socket Error:", e);
        } catch (IOException e) {
            Log.e("Udp Send:", "IO Error:", e);
        }
    }
}
