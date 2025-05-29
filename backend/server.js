import app from "./app.js";
// import connectDatabase from "./config/database.js";
import { connection as connectDatabase } from "./database/connection.js";
import cloudinary from 'cloudinary';
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { Auction } from "./models/auctionSchema.js";

// Configurare variabilele de mediu
dotenv.config({ path: "./config/config.env" });

// Handling uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to uncaught exception`);
  process.exit(1);
});

// Configuram cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO connections
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  
  // Join an auction room
  socket.on("joinAuction", (auctionId) => {
    socket.join(`auction:${auctionId}`);
    console.log(`Socket ${socket.id} joined auction:${auctionId}`);
    
    socket.emit("auctionJoined", {
      auctionId,
      message: "Connected to auction updates"
    });
  });
  
  // Leave an auction room
  socket.on("leaveAuction", (auctionId) => {
    socket.leave(`auction:${auctionId}`);
    console.log(`Socket ${socket.id} left auction:${auctionId}`);
  });
  
  // Join user's personal room for notifications and messages
  socket.on("authenticate", (userId) => {
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`Socket ${socket.id} authenticated for user:${userId}`);
      
      // Confirmă autentificarea
      socket.emit("authenticated", { userId });
    }
  });
  
  // Handle joining chat rooms for specific conversations
  socket.on("joinChat", ({ auctionId, userId }) => {
    if (auctionId && userId) {
      const chatRoom = `chat:${auctionId}:${userId}`;
      socket.join(chatRoom);
      console.log(`Socket ${socket.id} joined chat room: ${chatRoom}`);
    }
  });
  
  // Handle leaving chat rooms
  socket.on("leaveChat", ({ auctionId, userId }) => {
    if (auctionId && userId) {
      const chatRoom = `chat:${auctionId}:${userId}`;
      socket.leave(chatRoom);
      console.log(`Socket ${socket.id} left chat room: ${chatRoom}`);
    }
  });
  
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Simplu timer pentru actualizarea timpului ramas
const activeTimers = new Map();

// Functie pentru a formata timpul ramas
const formatTimeRemaining = (ms) => {
  if (ms <= 0) return "Auction ended";
  
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

// Start timer pentru o licitatie
const startAuctionTimer = async (auctionId) => {
  // Nu pornim timer daca exista deja
  if (activeTimers.has(auctionId)) return;
  
  try {
    const auction = await Auction.findById(auctionId);
    if (!auction) return;
    
    const endTime = new Date(auction.endTime).getTime();
    
    // Cream un interval pentru a actualiza timpul ramas la fiecare secunda
    const timerId = setInterval(async () => {
      const now = Date.now();
      const timeRemaining = endTime - now;
      
      // Dacă licitatia s-a terminat
      if (timeRemaining <= 0) {
        clearInterval(timerId);
        activeTimers.delete(auctionId);
        
        // Emitem eveniment pentru incheierea licitatiei
        io.to(`auction:${auctionId}`).emit("auctionEnded", { 
          auctionId,
          message: "Auction has ended"
        });
        
        return;
      }
      
      // Emitem actualizarea timpului la fiecare secunda
      io.to(`auction:${auctionId}`).emit("timeUpdate", {
        auctionId,
        timeRemaining,
        formattedTime: formatTimeRemaining(timeRemaining)
      });
    }, 1000);
    
    activeTimers.set(auctionId, timerId);
    
  } catch (error) {
    console.error("Error in auction timer:", error);
  }
};

//Pentru a porni timer-ele cand utilizatorii accesează o licitatie
export const auctionService = {
  startAuctionTimer,
  formatTimeRemaining
};

// Pornim serverul
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to unhandled promise rejection`);

  httpServer.close(() => {
    process.exit(1);
  });
});