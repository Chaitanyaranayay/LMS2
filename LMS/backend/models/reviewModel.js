import mongoose from "mongoose";
const reviewSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    user: {
     type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    },
    reviewedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
)

// Prevent duplicate reviews by same user on same course at DB level
reviewSchema.index({ course: 1, user: 1 }, { unique: true })
reviewSchema.index({ course: 1 })

const Review = mongoose.model("Review", reviewSchema);
export default Review;