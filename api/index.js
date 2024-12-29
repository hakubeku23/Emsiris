// api/index.js (for Home Route)
require('dotenv').config();
const axios = require('axios');

module.exports = async (req, res) => {
  const TMDB_API_KEY = process.env.TMDB_API_KEY;

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

    return res.render('index', { movies, series });
  } catch (error) {
    console.error("Error fetching trending data:", error.response?.data || error.message);
    return res.render('error', { message: 'Error fetching trending data.' });
  }
};
