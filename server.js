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
app.get('/detail/:mediaType/:id', async (req, res) => {
  const { mediaType, id } = req.params;
  try {
    let itemData;

    // Log request parameters to check
    console.log(`Fetching details for: ${mediaType} with ID: ${id}`);

    if (mediaType === 'movie') {
      const movieRes = await axios.get(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`
      );
      itemData = movieRes.data;
      console.log("Movie Data:", itemData); // Log movie data for debugging
    } else if (mediaType === 'tv') {
      const seriesRes = await axios.get(
        `https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`
      );
      itemData = seriesRes.data;
      console.log("TV Series Data:", itemData); // Log series data for debugging
    } else {
      return res.render('error', { message: 'Invalid type specified.' });
    }

    if (!itemData) {
      return res.render('error', { message: `No data found for ${mediaType}.` });
    }

    res.render('detail', { item: itemData, mediaType });
  } catch (error) {
    console.error(`Error fetching ${mediaType} details:`, error.response?.data || error.message);
    res.render('error', { message: `Error fetching ${mediaType} details.` });
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