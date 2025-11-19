const express = require('express');
const multer = require('multer');
const Replicate = require('replicate');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Replicate
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|avif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// API endpoint for generating posters
app.post('/api/generate', upload.single('image'), async (req, res) => {
  try {
    const { prompt, size = '2K', width = 2048, height = 2048, aspect_ratio = '4:3' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Prepare input for Replicate
    const input = {
      size: size,
      width: parseInt(width),
      height: parseInt(height),
      prompt: prompt,
      max_images: 4, // Generate 4 variations
      aspect_ratio: aspect_ratio,
      enhance_prompt: true,
      sequential_image_generation: 'disabled'
    };

    // If an image was uploaded, add it to the input
    if (req.file) {
      // Construct a publicly accessible URL for the uploaded image
      // Note: On Render.com, uploaded files are ephemeral and will be lost on restart
      // For production, consider using a cloud storage service (Cloudinary, S3, etc.)
      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
      const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
      input.image_input = [imageUrl];
    }

    console.log('Generating images with input:', { ...input, image_input: input.image_input ? '[image provided]' : undefined });

    // Run the model
    const output = await replicate.run("bytedance/seedream-4", { input });

    // Process the output to get URLs
    const imageUrls = [];
    for (const file of output) {
      if (typeof file.url === 'function') {
        imageUrls.push(file.url());
      } else if (typeof file === 'string') {
        imageUrls.push(file);
      } else if (file.url) {
        imageUrls.push(file.url);
      }
    }

    // Clean up uploaded file after processing
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (error) {
        console.error('Error deleting uploaded file:', error);
      }
    }

    res.json({
      success: true,
      images: imageUrls,
      count: imageUrls.length
    });

  } catch (error) {
    console.error('Error generating images:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    res.status(500).json({
      error: 'Failed to generate images',
      message: error.message
    });
  }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Poster Pro server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to use the app`);
});

