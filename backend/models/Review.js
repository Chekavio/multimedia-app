import mongoose from 'mongoose';
import Film from './Film.js';  // ✅ Import the Film model

const reviewSchema = new mongoose.Schema({
  user_id: { type: Number, required: true },         // PostgreSQL User ID
  resource_id: { type: String, required: true },     // UUID linking to films
  resource_type: { type: String, required: true },   // 'film', 'book', etc.
  rating: { type: Number, min: 1, max: 5, required: true },
  review_text: String,
  created_at: { type: Date, default: Date.now },
});

// ✅ Post-save hook to update the average_rate
reviewSchema.post('save', async function (doc) {
  try {
    if (doc.resource_type === 'film') {  // ✅ Only update if it's a film
      const reviews = await mongoose.model('Review').find({ resource_id: doc.resource_id });

      const averageRate = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

      // ✅ Update the average_rate in the films collection
      await Film.updateOne(
        { resource_id: doc.resource_id },
        { $set: { average_rate: averageRate.toFixed(2) } }  // Rounded to 2 decimal places
      );

      console.log(`🎯 Updated average_rate for film ${doc.resource_id}: ${averageRate.toFixed(2)}`);
    }
  } catch (error) {
    console.error('❌ Error updating average_rate:', error);
  }
});

export default mongoose.model('Review', reviewSchema);
