require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

// Set up the view engine and serve static files
app.set('view engine', 'ejs');
app.use(express.static('public')); // Serve static files (CSS, JS)

// TMDB API Key from environment variables
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Home Route: Trending Movies and Series
app.get('/', async (req, res) => {
  try {
    // Fetch trending content
    const trendingRes = await axios.get(
      `https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_API_KEY}`
    );

    // Filter movies and series
    const movies = trendingRes.data.results.filter(
      (item) => item.media_type === 'movie' && item.title && item.poster_path
    );
    const series = trendingRes.data.results.filter(
      (item) => item.media_type === 'tv' && item.name && item.poster_path
    );

    res.render('index', { movies, series }); // Pass data to the index view
  } catch (error) {
    console.error("Error fetching trending data:", error.response?.data || error.message);
    res.render('error', { message: 'Error fetching trending data.' });
  }
});

// Search Route
app.get('/search', async (req, res) => {
  const query = req.query.query; // Get the search term from the query string
  if (!query) {
    return res.render('search', { query: '', movies: [], series: [] }); // Handle empty queries
  }

  try {
    // Fetch search results
    const searchRes = await axios.get(
      `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
    );

    // Filter movies and series
    const movies = searchRes.data.results.filter(
      (item) => item.media_type === 'movie' && item.title && item.poster_path
    );
    const series = searchRes.data.results.filter(
      (item) => item.media_type === 'tv' && item.name && item.poster_path
    );

    res.render('search', { query, movies, series }); // Pass data to the search view
  } catch (error) {
    console.error("Error during search:", error.response?.data || error.message);
    res.render('search', { query, movies: [], series: [] });
  }
});

// Combined Details Route for Movie and Series
app.get('/detail/:mediaType/:id', async (req, res) => {
  const { mediaType, id } = req.params;
  try {
    let itemData;

    if (mediaType === 'movie') {
      const movieRes = await axios.get(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}`
      );
      itemData = movieRes.data;
    } else if (mediaType === 'tv') {
      const seriesRes = await axios.get(
        `https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY}`
      );
      itemData = seriesRes.data;
    } else {
      return res.render('error', { message: 'Invalid type specified.' });
    }

    res.render('detail', { item: itemData, mediaType }); // Pass item and type to detail view
  } catch (error) {
    console.error(`Error fetching ${mediaType} details:`, error.response?.data || error.message);
    res.render('error', { message: `Error fetching ${mediaType} details.` });
  }
});

// API Route to Fetch Videos for Movies or TV
app.get('/api/videos/:mediaType/:id', async (req, res) => {
  const { mediaType, id } = req.params;
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/${mediaType}/${id}/videos?api_key=${TMDB_API_KEY}&language=en-US`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching videos from TMDB:', error);
    res.status(500).send('Error fetching videos.');
  }
});

// Error Page Route
app.get('/error', (req, res) => {
  res.render('error', { message: 'An unknown error occurred.' });
});

// Export the Express app for Vercel
module.exports = app;
