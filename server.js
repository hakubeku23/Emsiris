require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;  // Use environment port for deployment (e.g., Vercel)

app.set('view engine', 'ejs');
app.use(express.static('public')); // Serve static files (CSS, JS)

const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Home Route: Trending Movies and Series
app.get('/', async (req, res) => {
  try {
    const trendingRes = await axios.get(
      `https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_API_KEY}`
    );

    const movies = trendingRes.data.results.filter(
      (item) => item.media_type === 'movie' && item.title && item.poster_path
    );
    const series = trendingRes.data.results.filter(
      (item) => item.media_type === 'tv' && item.name && item.poster_path
    );

    res.render('index', { movies, series });
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
    const searchRes = await axios.get(
      `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
    );

    const movies = searchRes.data.results.filter(
      (item) => item.media_type === 'movie' && item.title && item.poster_path
    );
    const series = searchRes.data.results.filter(
      (item) => item.media_type === 'tv' && item.name && item.poster_path
    );

    res.render('search', { query, movies, series });
  } catch (error) {
    console.error("Error during search:", error.response?.data || error.message);
    res.render('search', { query, movies: [], series: [] });
  }
});

// Movie and Series Details Route (Combined)
app.get('/detail/movie/:id', async (req, res) => {
  try {
    const movieRes = await axios.get(
      `https://api.themoviedb.org/3/movie/${req.params.id}?api_key=${TMDB_API_KEY}`
    );
    res.render('detail', { item: movieRes.data, type: 'movie' });
  } catch (error) {
    console.error("Error fetching movie details:", error.response?.data || error.message);
    res.render('error', { message: 'Error fetching movie details.' });
  }
});

app.get('/detail/series/:id', async (req, res) => {
  try {
    const seriesRes = await axios.get(
      `https://api.themoviedb.org/3/tv/${req.params.id}?api_key=${TMDB_API_KEY}`
    );
    res.render('detail', { item: seriesRes.data, type: 'series' });
  } catch (error) {
    console.error("Error fetching series details:", error.response?.data || error.message);
    res.render('error', { message: 'Error fetching series details.' });
  }
});

app.get('/player', (req, res) => {
  res.render('player', {
      mediaType: req.query.mediaType,
      tmdbId: req.query.tmdbId
  });
});

// API Route for fetching Videos
app.get('/api/videos/:mediaType/:id', async (req, res) => {
  const { mediaType, id } = req.params;
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/${mediaType}/${id}/videos?api_key=${TMDB_API_KEY}&language=en-US`
    );
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

// Start the Server
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
