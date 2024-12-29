// api/videos.js (for Videos Route)
require('dotenv').config();
const axios = require('axios');

module.exports = async (req, res) => {
  const { mediaType, id } = req.query; // Expect mediaType and id as query params
  const TMDB_API_KEY = process.env.TMDB_API_KEY;

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/${mediaType}/${id}/videos?api_key=${TMDB_API_KEY}&language=en-US`
    );
    return res.json(response.data);
  } catch (error) {
    console.error('Error fetching videos from TMDB:', error);
    return res.status(500).send('Error fetching videos.');
  }
};
