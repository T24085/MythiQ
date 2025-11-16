# Ancient Art Gallery

A beautiful static website showcasing animated ancient art masterpieces. Videos are stored on YouTube and displayed in a modern, Grok-inspired grid layout.

## Features

- 🎨 Modern, dark-themed design inspired by Grok's gallery interface
- 📱 Fully responsive grid layout
- 🎬 YouTube video integration (regular videos and Shorts)
- 🖼️ Lazy-loaded thumbnails for optimal performance
- 🎯 Modal video player with smooth animations
- ⚡ Static site - perfect for GitHub Pages

## Setup

1. Clone this repository
2. No build process required - it's a pure static site
3. Open `index.html` in a browser to view locally

## Deployment to GitHub Pages

1. Push this repository to GitHub
2. Go to your repository settings
3. Navigate to "Pages" in the left sidebar
4. Select the branch (usually `main` or `master`)
5. Select the folder (usually `/ (root)`)
6. Click "Save"
7. Your site will be available at `https://[username].github.io/[repository-name]`

## Customization

### Adding Videos

Edit `script.js` and add new video objects to the `videos` array:

```javascript
{ id: 'YOUR_VIDEO_ID', type: 'video', title: 'Your Video Title' }
```

For YouTube Shorts, use `type: 'shorts'`.

### Styling

Modify `styles.css` to customize colors, spacing, and layout. The CSS variables at the top make it easy to change the theme:

```css
:root {
    --bg-primary: #0a0a0a;
    --accent: #6366f1;
    /* ... */
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - feel free to use this for your own projects!

