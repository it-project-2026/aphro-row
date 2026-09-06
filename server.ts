import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import cors from "cors";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { DatabaseRepository } from "./src/server/db";

// Initialize Firebase Admin
try {
  admin.initializeApp({
    projectId: "conductive-catcher-w9v0l",
  });
} catch (e) {
  console.warn("Firebase Admin already initialized or failed:", e);
}

const db = getFirestore();
const messaging = getMessaging();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Static uploads directory for photos
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  app.use("/uploads", express.static(uploadsDir));

  // Simple in-memory cache for Nominatim
  const geoCache = new Map();

  // ==========================================
  // APHRO CENTRALIZED REST API ENDPOINTS
  // ==========================================

  // Health / Connection Test
  app.get("/api/health", (req, res) => {
    res.json({
      status: "success",
      message: "APHRO PostgreSQL Node.js Express API Server Active",
      database: DatabaseRepository.getPrismaStatus(),
      timestamp: new Date().toISOString(),
    });
  });

  // GET Router handler for GASApiService compatibility & query param dispatching
  app.get("/api", async (req, res) => {
    const action = String(req.query.action || "ping");
    const unitId = req.query.unitId ? String(req.query.unitId) : undefined;

    try {
      if (action === "ping") {
        return res.json({ status: "success", message: "PONG" });
      }

      if (action === "inisiasi" || action === "getInisiasi") {
        const units = await DatabaseRepository.getInisiasiUnits();
        return res.json({ status: "success", data: units, source: "postgresql" });
      }

      if (action === "getVersions") {
        const versionInfo = await DatabaseRepository.getVersions();
        return res.json({ status: "success", ...versionInfo });
      }

      if (action === "getWorkOrders") {
        const data = await DatabaseRepository.getWorkOrders(unitId);
        return res.json({ status: "success", data });
      }

      if (action === "getRealisasi") {
        const data = await DatabaseRepository.getRealisasi(unitId);
        return res.json({ status: "success", data });
      }

      if (action === "getAbsensi") {
        const data = await DatabaseRepository.getAbsensi(unitId);
        return res.json({ status: "success", data });
      }

      if (action === "getUsers") {
        const data = await DatabaseRepository.getUsers(unitId);
        return res.json({ status: "success", data });
      }

      if (action === "getAllData") {
        const data = await DatabaseRepository.getAllData(unitId);
        return res.json({ status: "success", data });
      }

      if (action === "getDatabaseStats" || action === "dbStats") {
        const stats = await DatabaseRepository.getDatabaseStats();
        return res.json(stats);
      }

      if (["getULP", "getPenyulang", "getRegu", "getPetugas"].includes(action)) {
        const table = action.replace(/^get/, "").toUpperCase();
        const data = await DatabaseRepository.getMasterData(table, unitId);
        return res.json({ status: "success", data });
      }

      return res.json({ status: "success", message: `Action ${action} handled` });
    } catch (err: any) {
      console.error(`API GET error for action=${action}:`, err);
      res.status(500).json({ status: "error", message: err.message });
    }
  });

  // POST Router handler for Mutations, Login, Uploads, Logs
  app.post("/api", async (req, res) => {
    const action = req.body.action || req.query.action;
    const body = req.body;

    try {
      if (action === "login") {
        const result = await DatabaseRepository.login(body.username, body.password);
        return res.json(result);
      }

      if (action === "createWorkOrder") {
        const result = await DatabaseRepository.createWorkOrder(body.workOrder || body);
        return res.json(result);
      }

      if (action === "updateWorkOrder") {
        const result = await DatabaseRepository.updateWorkOrder(body.id || body.workOrder?.id, body.workOrder || body);
        return res.json(result);
      }

      if (action === "deleteWorkOrder") {
        const result = await DatabaseRepository.deleteWorkOrder(body.id);
        return res.json(result);
      }

      if (action === "saveRealisasi") {
        const result = await DatabaseRepository.saveRealisasi(body.realisasi || body);
        return res.json(result);
      }

      if (action === "updateRealisasi") {
        const result = await DatabaseRepository.saveRealisasi(body.realisasi || body);
        return res.json(result);
      }

      if (action === "deleteRealisasi") {
        const result = await DatabaseRepository.deleteRealisasi(body.id);
        return res.json(result);
      }

      if (action === "saveAbsensi") {
        const result = await DatabaseRepository.saveAbsensi(body.absensi || body);
        return res.json(result);
      }

      if (action === "deleteAbsensi") {
        const result = await DatabaseRepository.deleteAbsensi(body.id);
        return res.json(result);
      }

      if (action === "saveMasterData") {
        const result = await DatabaseRepository.saveMasterItem(body.sheetName || body.table, body.item || body);
        return res.json(result);
      }

      if (action === "deleteMasterData") {
        const result = await DatabaseRepository.deleteMasterItem(body.sheetName || body.table, body.id);
        return res.json(result);
      }

      if (action === "logActivity") {
        const result = await DatabaseRepository.addLog({
          user: body.user,
          aktivitas: body.aktivitas,
          modul: body.modul,
          unitId: body.unitId,
        });
        return res.json({ status: "success", data: result });
      }

      if (action === "uploadPhoto") {
        const { base64Data, filename, folderId } = body;
        const timeStamp = Date.now();
        const randId = Math.random().toString(36).substring(2, 8);
        const fileNameToSave = filename || `photo_${timeStamp}_${randId}.jpg`;
        const driveFileId = `drive_file_${timeStamp}_${randId}`;

        let fileUrl = `/uploads/${fileNameToSave}`;

        if (base64Data) {
          try {
            const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Clean, "base64");
            const filePath = path.join(uploadsDir, fileNameToSave);
            fs.writeFileSync(filePath, buffer);
            console.log(`[Photo Upload] File saved locally to ${filePath}`);
          } catch (fileErr) {
            console.warn("[Photo Upload] Failed to write base64 to disk, fallback url generated:", fileErr);
          }
        }

        // Return Google Drive metadata format for database persistence
        return res.json({
          status: "success",
          fileUrl: fileUrl,
          url: fileUrl,
          driveFileId: driveFileId,
          folderId: folderId || "1idu8U3COKEqdcCewdWntu9X06ZMnzskr",
          message: "Foto Berhasil Diunggah & Metadata Google Drive Tersimpan ke PostgreSQL",
        });
      }

      if (action === "initDatabaseSchema" || action === "initSchema") {
        const result = await DatabaseRepository.initDatabaseSchema();
        return res.json(result);
      }

      if (action === "migrateFromSpreadsheet" || action === "migrateSpreadsheet") {
        const result = await DatabaseRepository.migrateFromSpreadsheet();
        return res.json(result);
      }

      return res.json({ status: "success", message: `Action ${action} completed` });
    } catch (err: any) {
      console.error(`API POST error for action=${action}:`, err);
      res.status(500).json({ status: "error", message: err.message });
    }
  });

  // Notification endpoint
  app.post("/api/send-notification", async (req, res) => {
    const { reguName, woData } = req.body;
    
    if (!reguName || !woData) {
      return res.status(400).json({ error: "Missing reguName or woData" });
    }

    try {
      // 1. Get FCM tokens for this regu
      // We'll fetch all tokens and filter in code to handle case-insensitivity more easily
      // OR we can store them in uppercase. Let's fetch all and filter for now as it's more robust.
      const tokensSnapshot = await db.collection("fcm_tokens").get();
      
      const targetRegu = String(reguName).trim().toUpperCase();
      const tokens = tokensSnapshot.docs
        .map(doc => doc.data())
        .filter(data => (data.reguName || "").trim().toUpperCase() === targetRegu)
        .map(data => data.token);

      if (tokens.length === 0) {
        console.log(`No FCM tokens found for regu: ${reguName}`);
        return res.json({ success: true, message: "No tokens found, notification not sent" });
      }

      // 2. Format message
      const messageBody = `Ada Work Order untuk Team ${reguName}
No. Work ORDER : ${woData.nomorWO}
Tanggal WORK ORDER : ${woData.tanggal}
PENYULANG : ${woData.penyulangName}
START : ${woData.woMulai || "-"}
AKHIR : ${woData.woAkhir || "-"}
TARGET : ${woData.volumePekerjaan} ${woData.satuan}`;

      const message = {
        notification: {
          title: "Work Order Baru",
          body: messageBody,
        },
        data: {
          woId: woData.id || "",
          click_action: "FLUTTER_NOTIFICATION_CLICK", // for mobile
        },
        tokens: tokens,
      };

      // 3. Send notification
      const response = await messaging.sendEachForMulticast(message);
      
      console.log(`Successfully sent ${response.successCount} notifications`);
      res.json({ 
        success: true, 
        successCount: response.successCount, 
        failureCount: response.failureCount 
      });
    } catch (error: any) {
      console.error("Error sending notification:", error);
      res.status(500).json({ error: "Failed to send notification", details: error.message });
    }
  });

  // Proxy endpoint for Nominatim to avoid CORS issues
  app.get("/api/reverse-geocode", async (req, res) => {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: "Missing lat or lon parameters" });
    }

    const cacheKey = `${Number(lat).toFixed(6)},${Number(lon).toFixed(6)}`;
    if (geoCache.has(cacheKey)) {
      return res.json(geoCache.get(cacheKey));
    }

    try {
      const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
        params: {
          format: "json",
          lat,
          lon,
          zoom: 18,
          addressdetails: 1
        },
        headers: {
          "User-Agent": "APHRO-Asset-Protection-App-Proxy/1.0 (deddy.data74@gmail.com)",
          "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
        }
      });
      
      geoCache.set(cacheKey, response.data);
      res.json(response.data);
    } catch (error: any) {
      if (error.response?.status === 429) {
        console.warn("Nominatim Rate Limit Hit (429)");
        return res.status(429).json({ error: "Rate limit hit" });
      }
      
      console.error("Nominatim Proxy Error:", error.message);
      res.status(error.response?.status || 500).json({ 
        error: "Failed to fetch from Nominatim",
        details: error.message 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
