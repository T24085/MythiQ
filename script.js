// YouTube video data - extracted from provided URLs
const videos = [
    { id: 'aT3UkaEc-FA', type: 'video', title: 'Ancient Art Animation 1' },
    { id: 'H2DdT9jxkq4', type: 'video', title: 'Ancient Art Animation 2' },
    { id: 'vfVGUEnBVmA', type: 'video', title: 'Ancient Art Animation 3' },
    { id: 'oDzpjwDEGI0', type: 'video', title: 'Ancient Art Animation 4' },
    { id: 'u7EmRd0GLhQ', type: 'shorts', title: 'Ancient Art Short 1' },
    { id: 'u-4QAEbLzDc', type: 'shorts', title: 'Ancient Art Short 2' },
    { id: 'gnim33uJxzo', type: 'shorts', title: 'Ancient Art Short 3' },
    { id: 'hDqcPVimlRU', type: 'shorts', title: 'Ancient Art Short 4' },
    { id: 'mm410EAjU9k', type: 'shorts', title: 'Ancient Art Short 5' },
    { id: 'TmGP4hk5PXs', type: 'shorts', title: 'Ancient Art Short 6' },
    { id: 'NhfekOfB2KE', type: 'shorts', title: 'Ancient Art Short 7' },
    { id: '5GB-vBxK8B8', type: 'shorts', title: 'Ancient Art Short 8' },
    { id: 'Fm01PhdwcJ0', type: 'shorts', title: 'Ancient Art Short 9' },
    { id: 'g9WxDb2LtkQ', type: 'video', title: 'Ancient Art Animation 5' },
    { id: 'B1SXLTCgQZw', type: 'shorts', title: 'Ancient Art Short 10' },
    { id: 'eJV6linf5rM', type: 'shorts', title: 'Ancient Art Short 11' },
    { id: 'vtOYyp8PiMQ', type: 'shorts', title: 'Ancient Art Short 12' },
    { id: 'q7ixw5acIRc', type: 'shorts', title: 'Ancient Art Short 13' }
];

// Get YouTube thumbnail URLs in order of preference
// Start with hqdefault as it's most reliable, then try higher quality
function getThumbnailUrls(videoId) {
    return [
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    ];
}

// Load thumbnail with fallback chain
function loadThumbnailWithFallback(img, videoId) {
    const urls = getThumbnailUrls(videoId);
    let currentIndex = 0;
    
    function tryNextUrl() {
        if (currentIndex >= urls.length) {
            // All fallbacks failed, show placeholder
            img.style.backgroundColor = '#2a2a2a';
            img.style.display = 'flex';
            img.style.alignItems = 'center';
            img.style.justifyContent = 'center';
            img.style.minHeight = '200px';
            return;
        }
        
        // Set up error handler before changing src
        img.onerror = function() {
            currentIndex++;
            tryNextUrl();
        };
        img.onload = function() {
            // Successfully loaded, remove error handler
            img.onerror = null;
            img.onload = null;
        };
        // Try loading this URL
        img.src = urls[currentIndex];
    }
    
    // Start with first URL
    tryNextUrl();
}

// Get YouTube embed URL
function getEmbedUrl(videoId, type = 'video') {
    // Both regular videos and shorts use the same embed format
    // Simplified URL without origin to avoid CORS issues when running locally
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
}

// Create video card element
function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.setAttribute('data-video-id', video.id);
    card.setAttribute('data-video-type', video.type);

    const thumbnail = document.createElement('img');
    thumbnail.className = 'video-thumbnail';
    thumbnail.alt = video.title;
    thumbnail.loading = 'lazy';
    // Load thumbnail with automatic fallback chain
    loadThumbnailWithFallback(thumbnail, video.id);

    const playButton = document.createElement('div');
    playButton.className = 'play-button';

    const overlay = document.createElement('div');
    overlay.className = 'video-overlay';
    
    const info = document.createElement('div');
    info.className = 'video-info';
    
    const title = document.createElement('div');
    title.className = 'video-title';
    title.textContent = video.title;
    
    const type = document.createElement('div');
    type.className = 'video-type';
    type.textContent = video.type === 'shorts' ? 'Short' : 'Video';

    info.appendChild(title);
    info.appendChild(type);
    overlay.appendChild(info);
    
    card.appendChild(thumbnail);
    card.appendChild(playButton);
    card.appendChild(overlay);

    // Add click event to open modal
    card.addEventListener('click', () => openModal(video.id, video.type));

    return card;
}

// Open modal with video
function openModal(videoId, type) {
    console.log('Opening modal for video:', videoId, type);
    const modal = document.getElementById('modal');
    const videoContainer = document.getElementById('videoContainer');
    
    // Clear previous content
    videoContainer.innerHTML = '';
    
    // Create iframe with proper attributes
    const iframe = document.createElement('iframe');
    const embedUrl = getEmbedUrl(videoId, type);
    console.log('Embed URL:', embedUrl);
    
    iframe.src = embedUrl;
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('title', 'YouTube video player');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    
    // Add error handling
    iframe.onload = function() {
        console.log('Iframe loaded successfully');
    };
    iframe.onerror = function() {
        console.error('Error loading iframe');
    };
    
    videoContainer.appendChild(iframe);
    modal.classList.add('active');
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('modal');
    const videoContainer = document.getElementById('videoContainer');
    
    modal.classList.remove('active');
    videoContainer.innerHTML = '';
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
}

// Initialize gallery
function initGallery() {
    const gallery = document.getElementById('gallery');
    
    videos.forEach(video => {
        const card = createVideoCard(video);
        gallery.appendChild(card);
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initGallery();
    
    // Close modal on close button click
    document.getElementById('closeModal').addEventListener('click', closeModal);
    
    // Close modal on outside click
    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target.id === 'modal') {
            closeModal();
        }
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});

