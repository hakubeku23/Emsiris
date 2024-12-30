const express = require("express");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Home Route
app.get("/", async (req, res) => {
  try {
    const trendingResponse = await axios.get(
      `https://api.themoviedb.org/3/trending/all/week`,
      { params: { api_key: TMDB_API_KEY } }
    );
    const trendingItems = trendingResponse.data.results;
    res.render("index", { trendingItems });
  } catch (error) {
    console.error("Error fetching trending items:", error.response?.data || error.message);
    res.status(500).send("Error loading homepage.");
  }
});

// Search Route
app.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.redirect("/");
  }

  try {
    const searchResponse = await axios.get(
      `https://api.themoviedb.org/3/search/multi`,
      { params: { api_key: TMDB_API_KEY, query } }
    );
    const results = searchResponse.data.results;
    res.render("search", { results, query });
  } catch (error) {
    console.error("Error performing search:", error.response?.data || error.message);
    res.status(500).send("Error performing search.");
  }
});

// Detail Page Route
app.get("/item/:mediaType/:id", async (req, res) => {
  const { mediaType, id } = req.params;

  try {
    const itemResponse = await axios.get(
      `https://api.themoviedb.org/3/${mediaType}/${id}`,
      {
        params: { api_key: TMDB_API_KEY, append_to_response: "credits,videos" },
      }
    );
    const item = itemResponse.data;
    res.render("detail", { item });
  } catch (error) {
    console.error("Error fetching item details:", error.response?.data || error.message);
    res.status(500).send("Error loading details.");
  }
});

// API Route for Trailers
app.get("/api/videos/:mediaType/:id", async (req, res) => {
  const { mediaType, id } = req.params;

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/${mediaType}/${id}/videos`,
      { params: { api_key: TMDB_API_KEY } }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching videos:", error.response?.data || error.message);
    res.status(500).json({ error: "Error fetching videos." });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).render("404", { message: "Page not found." });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
