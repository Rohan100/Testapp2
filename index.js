import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { prettifyConversationHistory } from "./helper.js";
dotenv.config();
const app = express();
app.use(express.json());

const slackApi = axios.create({
  baseURL: "https://slack.com/api/",
  headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
});

// Send a message
app.post("/message/send", async (req, res) => {
  const { channel, text } = req.body;
  try {
    const response = await slackApi.post("chat.postMessage", { channel, text });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Schedule a message
app.post("/message/schedule", async (req, res) => {
  const { channel, text, date, time } = req.body; // date = "YYYY-MM-DD", time = "HH:MM"
  
  try {
    const dateTimeString = `${date}T${time}:00`;
    const timestamp = new Date(dateTimeString).getTime() / 1000; // Convert to seconds
    
    if (isNaN(timestamp)) {
      return res.status(400).json({ error: "Invalid date or time format" });
    }
    
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (timestamp <= currentTimestamp) {
      return res.status(400).json({ error: "Scheduled time must be in the future" });
    }
    
    const response = await slackApi.post("chat.scheduleMessage", { 
      channel, 
      text, 
      post_at: Math.floor(timestamp) 
    });
    
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Retrieve messages
app.get("/messages/:channel", async (req, res) => {
  const { channel } = req.params;
  console.log(channel);

  try {
    const response = await slackApi.get("conversations.history", {
      params: { channel }
    });
    
    if (response.data.ok) {
      const prettifiedMessages = prettifyConversationHistory(response.data.messages);
      
      res.json({
        success: true,
        channel: channel,
        message_count: prettifiedMessages.length,
        messages: prettifiedMessages
      });
    } else {
      res.status(400).json({ error: response.data.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});

// Edit a message
app.post("/message/edit", async (req, res) => {
  const { channel, ts, text } = req.body;
  try {
    const response = await slackApi.post("chat.update", { channel, ts, text });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a message
app.post("/message/delete", async (req, res) => {
  const { channel, ts } = req.body;
  console.log(channel, ts);
  try {
    const response = await slackApi.post("chat.delete", { channel, ts });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Backend running on http://localhost:3000"));
