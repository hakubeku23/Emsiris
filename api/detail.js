// api/detail.js (for Movie and Series Details)
require('dotenv').config();
const axios = require('axios');

module.exports = async (req, res) => {
  const { mediaType, id } = req.query; // Expect mediaType and id as query params
  const TMDB_API_KEY = process.env.TMDB_API_KEY;

  try {
    let itemData;

    if (mediaType === 'movie') {
      const movieRes = await axios.get(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`
      );
      itemData = movieRes.data;
    } else if (mediaType === 'tv') {
      const seriesRes = await axios.get(
        `https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`
      );
      itemData = seriesRes.data;
    } else {
      return res.render('error', { message: 'Invalid type specified.' });
    }

    return res.render('detail', { item: itemData, mediaType });
  } catch (error) {
    console.error(`Error fetching ${mediaType} details:`, error.response?.data || error.message);
    return res.render('error', { message: `Error fetching ${mediaType} details.` });
  }
};
