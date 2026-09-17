import History from '../models/History.js';

export const saveHistory = async (req, res) => {
  try {
    const { userId, cropName, imageUrl, location, waterFootprint, suitabilityCategory, irrigationMethod, suitability, language } = req.body;
    
    const newHistory = await History.create({
      userId,
      cropName,
      imageUrl,
      location,
      waterFootprint,
      suitabilityCategory: suitabilityCategory || 'Moderate', // Fallback for old data
      irrigationMethod,
      suitability,
      language
    });
    
    res.status(201).json(newHistory);
  } catch (error) {
    console.error('Error saving history:', error);
    res.status(500).json({ message: 'Error saving history' });
  }
};

export const getHistory = async (req, res) => {
  try {
    const { userId } = req.query; // Expecting userId in query params
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const history = await History.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Error fetching history' });
  }
};

export const deleteHistory = async (req, res) => {
  try {
    const { id } = req.params;
    await History.findByIdAndDelete(id);
    res.status(200).json({ message: 'History deleted successfully' });
  } catch (error) {
    console.error('Error deleting history:', error);
    res.status(500).json({ message: 'Error deleting history' });
  }
};
