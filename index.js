const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "https://www.zoopla.co.uk"],
  })
);

app.use(express.json());

app.get("/directions", async (req, res) => {
  const { origin, destination } = req.query;
  const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  if (!origin || !destination) {
    return res.status(400).json({ error: "Origin and destination are required" });
  }

  async function getAllModeData() {
    console.log("object");
    const modes = ["driving", "walking", "bicycling", "transit"]; // Define modes

    try {
      // Fetch directions for each mode
      const requests = modes.map((mode) => {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(
          destination
        )}&mode=${mode}&alternatives=true&key=${API_KEY}`;
        return fetch(url).then((response) => response.json());
      });

      // Wait for all requests to complete
      const results = await Promise.all(requests);

      // Organize results by mode
      const responseData = modes.reduce((acc, mode, index) => {
        acc[mode] = results[index];
        return acc;
      }, {});

      return responseData;
    } catch (error) {
      console.log("Error fetching directions:", error);
      //   res.status(500).json({ error: "Failed to fetch directions" });
    }
  }

  try {
    // Construct the URL for the Google Maps Directions API
    const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(
      destination
    )}&alternatives=true&key=${API_KEY}`;

    // Fetch data from Google Maps Directions API
    const response = await fetch(apiUrl);
    const data = await response.json();

    // get data for each modes
    const modeData = (await getAllModeData()) || [];

    data.modes = modeData;

    // Forward the raw API response to the client
    res.json(data);
  } catch (error) {
    console.error("Error fetching commute information:", error);
    res.status(500).json({ error: "Error fetching commute information" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
