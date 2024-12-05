const express = require("express");
const { fileURLToPath } = require("url");
const path = require("path");
const axios = require("axios");
const PocketBase = require("pocketbase/cjs");

const app = express();

const PORT = 3000;

const pb = new PocketBase("https://gues.pockethost.io");
// Set EJS as the templating engine
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ES module equivalent of __dirname

app.set("views", path.join(__dirname, "views"));

// Routes
app.get("/", (req, res) => {
  res.render("index"); // Render the EJS file
});
// API endpoint to handle guest messages
app.post("/api/guest", async (req, res) => {
  const { message } = req.body;

  // Log the guest's message
  console.log(`Guest Message: ${message}`);
  await pb.collection("conversations").create({
    body: message,
    createdAt: new Date().toISOString(),
    sentBy: "guest",
  });

  // Define the JSON payload with the updated message body
  const payload = {
    conversation: {
      _id: "66eb750b6d052500110d9183",
      accountId: "61b795a04711ee00327b3a83",
      assignee: null,
      conversationWith: "Guest",
      createdAt: "2024-09-19T00:49:15.855Z",
      firstReceptionist: "Tech Support",
      guestId: "66eb750b2973828df9fa459e",
      integration: {
        _id: "62017b5786eca60033cb2325",
        airbnb2: {
          guestId: 523935660,
          id: "1936170885",
        },
        platform: "airbnb2",
      },
      isRead: true,
      language: "en",
      lastModifiedAt: "2024-12-03T21:17:40.310Z",
      lastUpdatedAt: "2024-12-03T20:53:35.000Z",
      lastUpdatedFromGuest: "2024-12-03T20:53:35.000Z",
      meta: {
        guestName: "Jacob Porte EM",
        reservations: [
          {
            _id: "66eb750b09382c00a236e460",
            checkIn: "2025-02-01T21:00:00.000Z",
            checkOut: "2025-02-04T15:00:00.000Z",
            confirmationCode: "HMTA4N2M8T",
          },
        ],
      },
      pendingTasks: [],
      priority: 10,
      snoozedUntil: null,
      status: "OPEN",
      thread: [
        {
          _id: "674faa715b9511001360e7a4",
          bcc: [],
          body: message, // Update the body with the guest's message
          cc: [],
          createdAt: "2024-12-04T01:03:33.000Z",
          feedback: {},
          module: "airbnb2",
          postId: "674faa715b9511001360e7a4",
          to: [],
          type: "fromGuest",
        },
      ],
    },
    event: "reservation.messageReceived",
    message: {
      bcc: [],
      body: message, // Update the body with the guest's message
      cc: [],
      createdAt: new Date().toISOString(),
      feedback: {},
      module: "airbnb2",
      postId: "674faa715b9511001360e7a4",
      to: [],
      type: "fromGuest",
    },
    reservationId: "66eb750b09382c00a236e460",
  };

  // Send the JSON payload to the external API
  try {
    const response = await axios.post(
      "https://glowing-griffon-hopelessly.ngrok-free.app",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("Response from external API:", response.data.ai);

    await pb.collection("conversations").create({
      body: response.data.ai,
      createdAt: new Date().toISOString(),
      sentBy: "host",
    });

    // Respond to the frontend
    res.json({ response: "Message sent successfully!" });
  } catch (error) {
    console.error(
      "Error sending message to external API:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to send message to external API" });
  }
});

// API endpoint to handle host messages
app.post("/api/host", async (req, res) => {
  const { message } = req.body;

  // Define the JSON payload for host
  const payload = {
    conversation: {
      _id: "66eb750b6d052500110d9183",
      accountId: "61b795a04711ee00327b3a83",
      assignee: null,
      conversationWith: "Guest",
      createdAt: "2024-12-03T19:05:37.714Z",
      firstReceptionist: "Jacob Porte",
      guestId: "66eb750b2973828df9fa459e",
      integration: {
        _id: "662171ee6f78b0dbb895844e",
        airbnb2: {
          guestId: 106849831,
          id: "2003094372",
        },
        platform: "airbnb2",
      },
      isRead: true,
      language: "en",
      lastModifiedAt: "2024-12-03T20:17:36.666Z",
      lastUpdatedAt: "2024-12-03T20:17:36.666Z",
      lastUpdatedFromGuest: "2024-12-03T19:05:38.388Z",
      meta: {
        guestName: "Jacob Porte EM",
        reservations: [
          {
            _id: "674f56817261750014991558",
            checkIn: "2024-12-27T21:00:00.000Z",
            checkOut: "2025-01-03T15:00:00.000Z",
          },
        ],
      },
      pendingTasks: [],
      priority: 10,
      snoozedUntil: null,
      status: "OPEN",
      thread: [],
    },
    event: "reservation.messageSent",
    message: {
      bcc: [],
      body: message, // Host message body
      cc: [],
      createdAt: new Date().toISOString(),
      feedback: {},
      module: "airbnb2",
      postId: "674faa715b9511001360e7a4",
      reservationId: "674f56817261750014991558",
      sentAt: new Date().toISOString(),
      to: [],
      type: "fromHost",
    },
    reservationId: "674f56817261750014991558",
  };

  // Send the JSON payload to the external API
  try {
    const response = await axios.post(
      "https://glowing-griffon-hopelessly.ngrok-free.app/message_sent",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("Response from external API:", response.data);
    if (response.status == 200) {
      await pb.collection("conversations").create({
        body: message,
        createdAt: new Date().toISOString(),
        sentBy: "host",
      });
      console.log("host message created");
    }

    res.json({ response: "Host message sent successfully!" });
  } catch (error) {
    console.error(
      "Error sending host message to external API:",
      error.response?.data || error.message
    );
    res
      .status(500)
      .json({ error: "Failed to send host message to external API" });
  }
});

// Route to fetch all conversations
app.get("/api/conversations", async (req, res) => {
  try {
    const conversations = await pb.collection("conversations").getFullList({
      sort: "-created",
    });
    // reverse the list
    conversations.reverse();
    // console.log(conversations);

    res.json(conversations);
  } catch (error) {
    console.error(
      "Error fetching conversations from PocketBase:",
      error.message
    );
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;
