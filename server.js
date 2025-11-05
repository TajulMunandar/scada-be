import mqtt from "mqtt";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

// Socket.IO dengan CORS
const io = new Server(server, {
  cors: { origin: "*" },
});

// ================= MQTT =================
const mqttOptions = {
  username: "xtend-idn",
  password: "Xtend@idn018",
  connectTimeout: 5000,
  reconnectPeriod: 2000, // coba reconnect tiap 2 detik
};

const mqttClient = mqtt.connect("mqtt://monpase.xtend.my.id:8112", mqttOptions);

mqttClient.on("connect", () => {
  console.log("✅ Connected to MQTT broker");
  mqttClient.subscribe("data/ipa-lhoksukon-3", (err) => {
    if (!err) console.log("📡 Subscribed to topic");
  });
});

mqttClient.on("reconnect", () => {
  console.log("🔄 Reconnecting to MQTT broker...");
});

mqttClient.on("error", (err) => {
  console.error("❌ MQTT Error:", err);
});

mqttClient.on("message", (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log("📩 MQTT Data:", data);
    io.emit("mqtt_message", data); // kirim ke semua client
  } catch (err) {
    console.error("❌ Failed to parse MQTT message:", err);
  }
});

// ================= Socket.IO =================
io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  socket.on("disconnect", (reason) => {
    console.log(`🔴 Client disconnected: ${socket.id}, reason: ${reason}`);
  });
});

// ================= Server listen =================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Node server running on port ${PORT}`);
});
