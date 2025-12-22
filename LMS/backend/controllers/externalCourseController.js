import axios from 'axios';
import Course from '../models/courseModel.js';
import Order from '../models/orderModel.js';

// Search Coursera courses (free public API)
const searchCourseraCourses = async (query) => {
  try {
    // Coursera's public API is unreliable, skip it for now
    console.log("Coursera search skipped (API unreliable)");
    return [];
  } catch (error) {
    console.error("Coursera API error:", error.message);
    return [];
  }
};

// Search YouTube educational content
const searchYouTubeCourses = async (query) => {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      console.log("YouTube API key not configured - skipping YouTube search");
      return [];
    }

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: `${query} tutorial`,
        type: 'video',
        maxResults: 8,
        videoDefinition: 'any',
        key: process.env.YOUTUBE_API_KEY
      }
    });

    if (!response.data.items || response.data.items.length === 0) {
      return [];
    }

    return response.data.items.map(item => ({
      platform: 'YouTube',
      title: item.snippet.title,
      description: item.snippet.description,
      price: 'Free',
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      rating: null,
      reviews: null,
      level: null,
      isExternal: true
    }));
  } catch (error) {
    console.error("YouTube API error:", error.response?.data?.error?.message || error.message);
    return [];
  }
};

// AI-powered intelligent search combining all sources
export const intelligentCourseSearch = async (req, res) => {
  try {
    const { query, includeExternal = true } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    let allCourses = [];
    let stats = { internal: 0, external: 0 };

    // 1. Search internal courses
    try {
      const internalCourses = await Course.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } }
        ]
      })
        .populate('creator', 'name')
        .limit(20);

      const mappedInternal = internalCourses.map(course => ({
        platform: 'Your LMS',
        title: course.title,
        description: course.description,
        price: course.price,
        thumbnail: course.thumbnail,
        url: `/viewcourse/${course._id}`,
        rating: course.reviews?.length > 0 
          ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length 
          : null,
        reviews: course.reviews?.length || 0,
        level: course.level,
        category: course.category,
        instructor: course.creator?.name,
        isExternal: false,
        _id: course._id
      }));

      allCourses.push(...mappedInternal);
      stats.internal = mappedInternal.length;
    } catch (err) {
      console.error("Internal course search error:", err);
    }

    // 2. Search external platforms (if enabled)
    if (includeExternal) {
      const youtubeResults = await searchYouTubeCourses(query);
      if (youtubeResults.length > 0) {
        allCourses.push(...youtubeResults);
        stats.external += youtubeResults.length;
      }
    }

    // Return results immediately without AI ranking to avoid errors
    return res.json({
      results: allCourses.slice(0, 30),
      sources: stats,
      mode: 'keyword',
      total: allCourses.length
    });

  } catch (error) {
    console.error("Intelligent search error:", error);
    return res.status(500).json({ 
      message: "Search failed", 
      error: error.message,
      results: []
    });
  }
};

// Get personalized course recommendations based on user history
export const getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Get user's enrolled courses
    const enrolledOrders = await Order.find({ user: userId })
      .populate('courses');
    
    const enrolledCourses = enrolledOrders.flatMap(order => order.courses);

    if (enrolledCourses.length === 0) {
      // New user - recommend popular courses
      const popularCourses = await Course.find()
        .sort({ 'reviews.length': -1 })
        .limit(10);
      
      return res.json({
        success: true,
        recommendations: popularCourses,
        reason: 'popular',
        message: 'Top rated courses for beginners'
      });
    }

    // 2. Extract categories and topics from enrolled courses
    const userCategories = [...new Set(enrolledCourses.map(c => c.category))];
    const userTopics = enrolledCourses.flatMap(c => 
      c.description.split(' ').filter(word => word.length > 5)
    );

    // 3. Find similar courses (same category, not enrolled)
    const recommendations = await Course.find({
      category: { $in: userCategories },
      _id: { $nin: enrolledCourses.map(c => c._id) }
    })
      .populate('createdBy', 'name')
      .limit(15);

    // 4. Use AI to personalize recommendations
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
User has completed courses in: ${userCategories.join(', ')}
Recent topics: ${userTopics.slice(0, 10).join(', ')}

Recommend next courses from this list:
${recommendations.map((c, i) => `${i + 1}. ${c.title} - ${c.category}`).join('\n')}

Return JSON array of indices for best 8 courses that would help user advance their skills.
Format: [1, 3, 5, ...]
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const indices = JSON.parse(text.match(/\[[\d,\s]+\]/)?.[0] || '[]');
        
        if (indices.length > 0) {
          const personalizedRecs = indices
            .map(idx => recommendations[idx - 1])
            .filter(Boolean);
          
          return res.json({
            success: true,
            recommendations: personalizedRecs,
            reason: 'ai-personalized',
            message: 'Courses tailored to your learning path'
          });
        }
      } catch (aiError) {
        console.error("AI recommendation error:", aiError.message);
      }
    }

    // Fallback
    res.json({
      success: true,
      recommendations: recommendations.slice(0, 8),
      reason: 'category-match',
      message: 'More courses in your areas of interest'
    });

  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get recommendations", 
      error: error.message 
    });
  }
};
