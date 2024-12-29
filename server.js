require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public')); // Serve static files (CSS, JS)


// TMDB API Key
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

// Movie Details Route
app.get('/detail/movie/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}&append_to_response=credits`);
    const itemData = response.data;
    
    res.render('detail', {
      item: itemData,
      mediaType: 'movie',  // This should be 'movie' for movies
    });
  } catch (error) {
    console.error('Error fetching movie details:', error);
    res.status(500).send('An error occurred');
  }
});

  
  // Series Details Route
  app.get('/detail/tv/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const response = await axios.get(`https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.TMDB_API_KEY}&append_to_response=credits`);
      const itemData = response.data;
      
      res.render('detail', {
        item: itemData,
        mediaType: 'tv',  // This should be 'tv' for series
      });
    } catch (error) {
      console.error('Error fetching TV series details:', error);
      res.status(500).send('An error occurred');
    }
  });
  
  
// Combined Details Route for Movie and Series
app.get('/detail/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  try {
    let item = null;

    if (type === 'movie') {
      const movieRes = await axios.get(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}`
      );
      item = movieRes.data;
    } else if (type === 'series') {
      const seriesRes = await axios.get(
        `https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY}`
      );
      item = seriesRes.data;
    } else {
      return res.render('error', { message: 'Invalid type specified.' });
    }

    res.render('detail', { item, type }); // Pass item and type to detail view
  } catch (error) {
    console.error(`Error fetching ${type} details:`, error.response?.data || error.message);
    res.render('error', { message: `Error fetching ${type} details.` });
  }
});

app.get('/api/videos/:mediaType/:id', async (req, res) => {
  const { mediaType, id } = req.params;
  const apiKey = process.env.TMDB_API_KEY;

  try {
      const response = await axios.get(`https://api.themoviedb.org/3/${mediaType}/${id}/videos?api_key=${apiKey}&language=en-US`);
      res.json(response.data);
  } catch (error) {
      console.error('Error fetching videos from TMDB:', error);
      res.status(500).send('Error fetching videos.');
  }
});

app.get('/detail/:mediaType/:id', async (req, res) => {
  const mediaType = req.params.mediaType;  // 'movie' or 'tv'
  const id = req.params.id;
  
  try {
      let itemData;
      
      if (mediaType === 'movie') {
          itemData = await fetchMovieDetails(id);  // Adjust based on how you're fetching movie details
      } else if (mediaType === 'tv') {
          itemData = await fetchTVDetails(id);  // Adjust based on how you're fetching TV details
      }

      res.render('detail', {
          item: itemData,
          mediaType: mediaType,  // Ensure that 'mediaType' is passed as 'movie' or 'tv'
      });

  } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching details');
  }
});



// Error Page
app.get('/error', (req, res) => {
  res.render('error', { message: 'An unknown error occurred.' });
});

// Start the Server
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
