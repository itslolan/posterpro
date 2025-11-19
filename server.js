const express = require('express');
const multer = require('multer');
const Replicate = require('replicate');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

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

    // If an image was uploaded, convert it to base64 and create a data URL
    if (req.file) {
      try {
        console.log('Converting image to base64...');
        
        // Read the image file
        const fileData = fsSync.readFileSync(req.file.path);
        
        // Convert to base64
        const base64Image = fileData.toString('base64');
        
        // Determine MIME type from file extension
        const ext = path.extname(req.file.originalname).toLowerCase();
        const mimeTypes = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
          '.avif': 'image/avif'
        };
        const mimeType = mimeTypes[ext] || 'image/jpeg';
        
        // Create data URL with proper prefix
        const dataUrl = `data:${mimeType};base64,${base64Image}`;
        
        console.log('Image converted to base64, size:', Math.round(base64Image.length / 1024), 'KB');
        input.image_input = [dataUrl];
        
        // Clean up local file after conversion
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up local file:', cleanupError);
        }
      } catch (conversionError) {
        console.error('Error converting image to base64:', conversionError);
        // Clean up uploaded file on error
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
        return res.status(500).json({
          error: 'Failed to convert image to base64',
          message: conversionError.message
        });
      }
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

    // Note: Local file cleanup is handled after uploading to Replicate

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

