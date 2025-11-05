// server.js
import mqtt from "mqtt";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // atau domain React kamu
  },
});

// Koneksi ke MQTT broker
const client = mqtt.connect("mqtt://monpase.xtend.my.id:8112", {
  username: "xtend-idn",
  password: "Xtend@idn018",
  connectTimeout: 5000,
  reconnectPeriod: 1000,
});

client.on("connect", () => {
  console.log("✅ Connected to MQTT broker");
  client.subscribe("data/ipa-lhoksukon-3", (err) => {
    if (!err) console.log("📡 Subscribed to topic");
  });
});

// Saat ada pesan baru dari broker MQTT
client.on("message", (topic, message) => {
  const data = JSON.parse(message.toString());
  console.log("📩 Received data:", data);

  // Kirim data ke semua client React yang terkoneksi
  io.emit("mqtt_message", data);
});

client.on("error", (err) => {
  console.error("❌ MQTT Error:", err);
});

server.listen(5000, () => {
  console.log("🚀 Node server running on port 5000");
});
