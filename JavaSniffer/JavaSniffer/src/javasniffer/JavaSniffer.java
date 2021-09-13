/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package javasniffer;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.SocketException;
import java.sql.Connection;
import java.sql.Statement;
import java.util.logging.Level;
import java.util.logging.Logger;
 import java.sql.*;


/**
 *
 * @author Arturo Pantoja
 */
public class JavaSniffer {


    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        try {
            DatagramSocket ds = new DatagramSocket(50000);
            byte[] buffer = new byte[1024];
            while (true) {
                try {
                    DatagramPacket dp = new DatagramPacket(buffer, buffer.length);
                    ds.receive(dp);
                    String msg = new String(dp.getData());
                    System.out.println(msg);
                    String Lat = msg.substring(5,15);
                    String Long = msg.substring(23,34);
                    String Time = msg.substring(46,55);
                    String Date = msg.substring(55,66);
                    System.out.println(Time);
                    System.out.println(Date);
                    String usuario = "root";
                    String clave = "J_apantojag99";
                    String url = "jdbc:mysql://localhost:3306/ubicación";
                    Connection con;
                    Statement stmt;
                    try {
                        Class.forName("com.mysql.cj.jdbc.Driver");
                    } catch (ClassNotFoundException ex) {
                        Logger.getLogger(JavaSniffer.class.getName()).log(Level.SEVERE, null, ex);
                    }
                    
                    try {
                        con = DriverManager.getConnection(url,usuario,clave);
                        stmt = con.createStatement();
                        stmt.executeUpdate("INSERT INTO registroUbi (Latitud, Longitud, Fecha, Hora) VALUE ('"+Lat+"','"+Long+"','"+Date+"','"+Time+"')");
                    } catch (SQLException ex) {
                        Logger.getLogger(JavaSniffer.class.getName()).log(Level.SEVERE, null, ex);
                    }
                    
                }catch (SocketException ex) {
                    Logger.getLogger(JavaSniffer.class.getName()).log(Level.SEVERE, null, ex);
                } catch (IOException ex) {
                    Logger.getLogger(JavaSniffer.class.getName()).log(Level.SEVERE, null, ex);
                }
            }
        } catch (SocketException e) {
            System.out.println("Socket: " + e.getMessage());
        } catch (IOException e) {
            System.out.println("IO: " + e.getMessage());
        }
        
    }
    
    
    
}
