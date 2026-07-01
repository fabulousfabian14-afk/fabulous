Image Persistence Setup for Render

Current State

The application currently has ephemeral image storage on Render's free tier. This means:
- ✅ Images work fine on localhost (development)
- ❌ Images are lost when the Render app restarts or redeploys
- ✅ Claim reason and proof text persist (stored in PostgreSQL database)

 Solution: Use Cloudinary for Cloud Image Storage

Cloudinary offers free tier storage suitable for this application.

 Step 1: Create Cloudinary Account

1. Sign up at [cloudinary.com](https://cloudinary.com/users/register/free)
2. Verify email
3. Go to Dashboard and note your:
   - Cloud Name
   - API Key
   - API Secret

 Step 2: Add Cloudinary to Your App

Install the required packages:
bash
npm install cloudinary multer-storage-cloudinary


 Step 3: Update render.yaml

Add environment variables to your render.yaml:

yaml
services:
  - type: web_service
    name: kahianga-tracker
    env: node
    plan: free
    branch: main
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: PORT
        value: "3000"
      - key: NODE_ENV
        value: "production"
      - key: PGSSLMODE
        value: "require"
      - key: CLOUDINARY_CLOUD_NAME
        fromService:
          type: env
          name: CLOUDINARY_CLOUD_NAME
      - key: CLOUDINARY_API_KEY
        fromService:
          type: env
          name: CLOUDINARY_API_KEY
      - key: CLOUDINARY_API_SECRET
        fromService:
          type: env
          name: CLOUDINARY_API_SECRET
    databaseId: kahianga-db
```

 Step 4: Set Environment Variables on Render

1. Go to your Kabianga Tracker service on Render
2. Click Environment
3. Add these variables:
   - `CLOUDINARY_CLOUD_NAME`: Your Cloud Name from Cloudinary dashboard
   - `CLOUDINARY_API_KEY`: Your API Key
   - `CLOUDINARY_API_SECRET`: Your API Secret

 Step 5: Update server.js

Replace the multer configuration (around line 20-50) with Cloudinary storage:

javascript
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isProduction = process.env.NODE_ENV === 'production';

let storage;
if (isProduction && process.env.CLOUDINARY_CLOUD_NAME) {
  // Use Cloudinary for production
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'kabianga-tracker',
      resource_type: 'auto',
    },
  });
} else {
  // Use local disk storage for development
  const multer = require('multer');
  storage = multer.diskStorage({
    destination: path.join(__dirname, 'public', 'uploads'),
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  });
}
```

 Step 6: Update Image Path Helper

Update the `getImagePath()` function to use Cloudinary URLs:
 javascript
function getImagePath(file) {
  if (!file) return null;
  
  if (isProduction && process.env.CLOUDINARY_CLOUD_NAME) {
    // Return Cloudinary secure URL
    return file.secure_url || file.path;
  }
  
  // Development: local storage
  return `uploads/${file.filename}`;
}


 Step 7: Redeploy

bash
git add .
git commit -m "Add Cloudinary integration for persistent image storage"
git push origin main


Render will automatically redeploy with the new environment variables.

 Testing

1. After deploying, log in as a student
2. Report a lost item with an image
3. Verify the image shows on the security dashboard
4. Restart the Render service → image should still be visible (since it's now on Cloudinary)

 Cloudinary Free Tier Limits

- 25 GB storage
- 25 GB bandwidth/month
- Up to 300k transformation operations/month

This is sufficient for the university tracker application.



Once Cloudinary is set up, images will persist permanently and sync across all deployments!
