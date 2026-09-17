import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cropName: {
    type: Object,
    required: true
  },
  imageUrl: {
    type: String, // Can be base64 string or URL
    required: false
  },
  location: {
    type: String,
    required: true
  },
  waterFootprint: {
    green: { type: Number, required: true },
    blue: { type: Number, required: true },
    grey: { type: Number, required: true },
    unit: { type: String, default: 'liters/kg' }
  },
  suitabilityCategory: {
    type: String,
    enum: ['Excellent', 'Good', 'Moderate', 'Poor', 'Not Suitable'],
    required: true
  },
  irrigationMethod: {
    type: String,
    enum: ['Drip', 'Sprinkler', 'Flood', 'Rain-fed', 'Micro-Sprinkler', 'Subsurface Drip'],
    required: false
  },
  suitability: {
    type: Object,
    required: true
  },
  language: {
    type: String,
    default: 'en'
  },
  plantingSeason: {
    type: Object,
    required: false
  },
  growthDuration: {
    type: Object,
    required: false
  },
  pestsAndCare: {
    type: Object,
    required: false
  }
}, { timestamps: true });

export default mongoose.model('History', historySchema);
