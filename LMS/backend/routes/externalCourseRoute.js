import express from 'express';
import { intelligentCourseSearch, getPersonalizedRecommendations } from '../controllers/externalCourseController.js';
import isAuth from '../middlewares/isAuth.js';

const router = express.Router();

// Intelligent search combining internal + external courses
router.post('/intelligent-search', intelligentCourseSearch);

// Personalized recommendations based on user history
router.get('/recommendations', isAuth, getPersonalizedRecommendations);

export default router;
