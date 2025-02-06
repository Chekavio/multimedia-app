import mongoose from 'mongoose';

const filmSchema = new mongoose.Schema({
  resource_id: { type: String, unique: true, required: true }, // ✅ UUID (universally unique identifier)
  tmdb_id: { type: Number, unique: true, required: true },
  title: { type: String, required: true },
  release_date: Date,
  director: String,
  genres: [String],
  description: String,
  poster_url: String,
  duration: Number,
  average_rate: { type: Number, default: 0 },
  casting: [String],
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model('Film', filmSchema);
