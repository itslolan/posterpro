# Poster Pro 🎨

A modern web application for creating AI-generated posters using the ByteDance SeeDream-4 model via Replicate.

## Features

- 🖼️ Generate 4 variations of posters from text prompts
- 📷 Optional image input for style reference
- 🎨 Customizable size and aspect ratio
- 💫 Beautiful, modern UI with dark theme
- ⚡ Fast and responsive design

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Replicate API token ([Get one here](https://replicate.com/account/api-tokens))

## Local Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd posterpro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   REPLICATE_API_TOKEN=your_replicate_api_token_here
   PORT=3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Or for production:
   ```bash
   npm start
   ```

5. **Open your browser**
   
   Visit `http://localhost:3000`

## Deployment to Render.com

### Option 1: Using Render Dashboard

1. **Create a new Web Service** on Render.com
2. **Connect your repository** (GitHub/GitLab/Bitbucket)
3. **Configure the service:**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** `Node`
4. **Add environment variable:**
   - Key: `REPLICATE_API_TOKEN`
   - Value: Your Replicate API token
5. **Deploy!**

### Option 2: Using render.yaml

1. Push your code to a Git repository
2. On Render.com, create a new **Blueprint** and connect your repository
3. Render will automatically detect and use the `render.yaml` file
4. Add your `REPLICATE_API_TOKEN` in the environment variables section
5. Deploy!

## Usage

1. Enter a text prompt describing the poster you want to create
2. (Optional) Upload an image for style reference
3. Select size and aspect ratio
4. Click "Generate Posters"
5. Wait for the AI to generate 4 variations
6. Download your favorite posters!

## API Endpoint

### POST `/api/generate`

Generate poster images from a prompt.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `prompt` (required): Text description of the poster
  - `image` (optional): Image file for style reference
  - `size` (optional): "1K" or "2K" (default: "2K")
  - `aspect_ratio` (optional): Aspect ratio like "4:3", "16:9", etc. (default: "4:3")

**Response:**
```json
{
  "success": true,
  "images": [
    "https://...",
    "https://...",
    "https://...",
    "https://..."
  ],
  "count": 4
}
```

## Project Structure

```
posterpro/
├── server.js          # Express server and API routes
├── package.json       # Dependencies and scripts
├── render.yaml        # Render.com deployment config
├── .env.example       # Environment variables template
├── .gitignore         # Git ignore rules
├── README.md          # This file
└── public/            # Frontend files
    ├── index.html     # Main HTML page
    ├── styles.css     # Styling
    └── script.js      # Frontend JavaScript
```

## Notes

- Image uploads are temporarily stored and cleaned up after processing
- For production deployments on Render.com, consider using a cloud storage service (like Cloudinary or S3) for image uploads if you need persistent storage
- The app generates 4 variations by default (configurable via `max_images` in the API)

## License

MIT

