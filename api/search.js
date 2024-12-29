// api/search.js (for Search Route)
require('dotenv').config();
const axios = require('axios');

module.exports = async (req, res) => {
  const query = req.query.query;
  const TMDB_API_KEY = process.env.TMDB_API_KEY;

  if (!query) {
    return res.render('search', { query: '', movies: [], series: [] });
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

    return res.render('search', { query, movies, series });
  } catch (error) {
    console.error("Error during search:", error.response?.data || error.message);
    return res.render('search', { query, movies: [], series: [] });
  }
};
