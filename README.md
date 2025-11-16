# MythiQ - Animated Art Gallery

A beautiful, modern website showcasing animated ancient art masterpieces. Videos are stored on YouTube and displayed in a stunning grid layout inspired by Grok's gallery interface. Built with Firebase for dynamic video management.

## Features

- 🎨 **Modern Design** - Dark-themed, Grok-inspired gallery interface with smooth animations
- 📱 **Fully Responsive** - Works perfectly on desktop, tablet, and mobile devices
- 🎬 **YouTube Integration** - Supports both regular videos (16:9) and YouTube Shorts (9:16)
- 🖼️ **Smart Thumbnails** - Automatic fallback chain for reliable thumbnail loading
- 🎯 **Modal Video Player** - Full-screen video playback with smooth transitions
- 🔥 **Firebase Integration** - Dynamic video management through Firestore
- ➕ **Easy Video Addition** - Simple form to add new YouTube videos
- ⚡ **Static Site** - Perfect for GitHub Pages hosting

## Setup

### 1. Firebase Configuration

The site uses Firebase Firestore to store video data. Make sure your Firebase project is set up:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create or select your project
3. Enable Firestore Database
4. The Firebase config is already set in `index.html`

### 2. Enable Firebase Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** authentication
3. Create a user account with your email and password
4. Note the user's UID (found in Authentication → Users)
5. Update the `ADMIN_UID` constant in `script.js` with your user's UID

**Important:** Only users with the matching UID can add videos to the gallery.

### 3. Firebase Security Rules

Update your Firestore rules to allow public reads and authenticated writes:

Copy the rules from `firestore.rules` to your Firebase Console:

1. Go to Firestore Database → **Rules** tab
2. Paste the rules from `firestore.rules`
3. Click **Publish**

The rules allow:
- **Public read** - Anyone can view videos
- **Authenticated write** - Only logged-in users can add/edit/delete videos
- **Admin check** - The app itself checks if the user's UID matches the admin UID

### 4. Migrate Existing Videos

If you have existing videos, use the migration tool:

1. Open `migrate-videos.html` in your browser
2. Click "Migrate Videos" to add all existing videos to Firebase
3. This only needs to be done once

### 4. Local Development

1. Clone this repository
2. Open `index.html` in a browser
3. For best results, use a local server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx http-server
   ```
4. Open `http://localhost:8000`

## Deployment to GitHub Pages

1. Push this repository to GitHub
2. Go to your repository settings
3. Navigate to **Pages** in the left sidebar
4. Select:
   - **Source**: Branch `main` (or `master`)
   - **Folder**: `/ (root)`
5. Click **Save**
6. Your site will be live at `https://[username].github.io/MythiQ`

## Adding Videos

### Authentication Required

Only authenticated admin users can add videos. To add videos:

1. Click the **"Login"** button in the header
2. Enter your admin email and password
3. Once logged in, the **"+ Add Video"** button will appear
4. Click **"+ Add Video"** to open the form
5. Paste any YouTube URL (regular video or Short)
6. Optionally add a custom title
7. Click **"Add Video"**

**Note:** The system checks that your user UID matches the admin UID before allowing video addition.

The system automatically:
- Extracts the video ID from any YouTube URL format
- Detects if it's a regular video or Short
- Loads the thumbnail
- Adds it to your gallery

### Supported URL Formats

- `https://youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://youtube.com/shorts/VIDEO_ID`
- `https://youtube.com/embed/VIDEO_ID`

## Customization

### Styling

Modify `styles.css` to customize the appearance. CSS variables make it easy:

```css
:root {
    --bg-primary: #0a0a0a;
    --accent: #6366f1;
    --accent-hover: #818cf8;
    /* ... */
}
```

### Branding

Update the title and subtitle in `index.html`:
```html
<h1 class="title">MythiQ</h1>
<p class="subtitle">Animated Masterpieces from History</p>
```

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Project Structure

```
MythiQ/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── script.js           # Main application logic
├── firebase-config.js  # Firebase configuration
├── migrate-videos.html # Migration tool for existing videos
├── firestore.rules     # Firebase security rules
└── README.md           # This file
```

## License

MIT License - feel free to use this for your own projects!
