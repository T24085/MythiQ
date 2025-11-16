// Import Firebase functions
import { collection, addDoc, getDocs, query, orderBy, Timestamp, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const db = window.db;
const auth = window.auth;

// Admin UID - only this user can add videos
const ADMIN_UID = 'AYILIKEKTUdizKXwNLKLrj2MDVT2';

// Hardcoded videos as fallback (until Firebase is populated)
const FALLBACK_VIDEOS = [
    { id: 'aT3UkaEc-FA', type: 'video', title: 'Ancient Art Animation 1', url: 'https://youtu.be/aT3UkaEc-FA' },
    { id: 'H2DdT9jxkq4', type: 'video', title: 'Ancient Art Animation 2', url: 'https://youtu.be/H2DdT9jxkq4' },
    { id: 'vfVGUEnBVmA', type: 'video', title: 'Ancient Art Animation 3', url: 'https://youtu.be/vfVGUEnBVmA' },
    { id: 'oDzpjwDEGI0', type: 'video', title: 'Ancient Art Animation 4', url: 'https://youtu.be/oDzpjwDEGI0' },
    { id: 'u7EmRd0GLhQ', type: 'shorts', title: 'Ancient Art Short 1', url: 'https://youtube.com/shorts/u7EmRd0GLhQ' },
    { id: 'u-4QAEbLzDc', type: 'shorts', title: 'Ancient Art Short 2', url: 'https://youtube.com/shorts/u-4QAEbLzDc' },
    { id: 'gnim33uJxzo', type: 'shorts', title: 'Ancient Art Short 3', url: 'https://youtube.com/shorts/gnim33uJxzo' },
    { id: 'hDqcPVimlRU', type: 'shorts', title: 'Ancient Art Short 4', url: 'https://youtube.com/shorts/hDqcPVimlRU' },
    { id: 'mm410EAjU9k', type: 'shorts', title: 'Ancient Art Short 5', url: 'https://youtube.com/shorts/mm410EAjU9k' },
    { id: 'TmGP4hk5PXs', type: 'shorts', title: 'Ancient Art Short 6', url: 'https://youtube.com/shorts/TmGP4hk5PXs' },
    { id: 'NhfekOfB2KE', type: 'shorts', title: 'Ancient Art Short 7', url: 'https://youtube.com/shorts/NhfekOfB2KE' },
    { id: '5GB-vBxK8B8', type: 'shorts', title: 'Ancient Art Short 8', url: 'https://youtube.com/shorts/5GB-vBxK8B8' },
    { id: 'Fm01PhdwcJ0', type: 'shorts', title: 'Ancient Art Short 9', url: 'https://youtube.com/shorts/Fm01PhdwcJ0' },
    { id: 'g9WxDb2LtkQ', type: 'video', title: 'Ancient Art Animation 5', url: 'https://youtu.be/g9WxDb2LtkQ' },
    { id: 'B1SXLTCgQZw', type: 'shorts', title: 'Ancient Art Short 10', url: 'https://youtube.com/shorts/B1SXLTCgQZw' },
    { id: 'eJV6linf5rM', type: 'shorts', title: 'Ancient Art Short 11', url: 'https://youtube.com/shorts/eJV6linf5rM' },
    { id: 'vtOYyp8PiMQ', type: 'shorts', title: 'Ancient Art Short 12', url: 'https://youtube.com/shorts/vtOYyp8PiMQ' },
    { id: 'q7ixw5acIRc', type: 'shorts', title: 'Ancient Art Short 13', url: 'https://youtube.com/shorts/q7ixw5acIRc' }
];

// Extract YouTube video ID from various URL formats
function extractVideoId(url) {
    if (!url) return null;
    
    // Regular video: https://youtube.com/watch?v=VIDEO_ID
    // Shorts: https://youtube.com/shorts/VIDEO_ID
    // Short format: https://youtu.be/VIDEO_ID
    
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    
    return null;
}

// Determine if video is a Short (9:16) or regular video (16:9)
function detectVideoType(url) {
    if (url.includes('/shorts/')) {
        return 'shorts';
    }
    return 'video';
}

// Get YouTube thumbnail URLs in order of preference
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
            img.style.backgroundColor = '#2a2a2a';
            img.style.display = 'flex';
            img.style.alignItems = 'center';
            img.style.justifyContent = 'center';
            img.style.minHeight = '200px';
            return;
        }
        
        img.onerror = function() {
            currentIndex++;
            tryNextUrl();
        };
        img.onload = function() {
            img.onerror = null;
            img.onload = null;
        };
        img.src = urls[currentIndex];
    }
    
    tryNextUrl();
}

// Get YouTube embed URL
function getEmbedUrl(videoId, type = 'video') {
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
    loadThumbnailWithFallback(thumbnail, video.id);

    const playButton = document.createElement('div');
    playButton.className = 'play-button';

    const overlay = document.createElement('div');
    overlay.className = 'video-overlay';
    
    const info = document.createElement('div');
    info.className = 'video-info';
    
    const title = document.createElement('div');
    title.className = 'video-title';
    title.textContent = video.title || 'Untitled Video';
    
    const type = document.createElement('div');
    type.className = 'video-type';
    type.textContent = video.type === 'shorts' ? 'Short' : 'Video';

    info.appendChild(title);
    info.appendChild(type);
    overlay.appendChild(info);
    
    // Delete button (only visible to admins)
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-video-btn';
    deleteButton.innerHTML = '×';
    deleteButton.title = 'Delete video';
    deleteButton.style.display = isAdmin() ? 'flex' : 'none';
    
    // Stop click propagation so delete button doesn't trigger video play
    deleteButton.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this video?')) {
            await deleteVideo(video);
        }
    });
    
    card.appendChild(thumbnail);
    card.appendChild(playButton);
    card.appendChild(overlay);
    card.appendChild(deleteButton);

    card.addEventListener('click', () => openModal(video.id, video.type));

    return card;
}

// Open modal with video
function openModal(videoId, type) {
    const modal = document.getElementById('modal');
    const videoContainer = document.getElementById('videoContainer');
    
    videoContainer.innerHTML = '';
    
    const iframe = document.createElement('iframe');
    iframe.src = getEmbedUrl(videoId, type);
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('title', 'YouTube video player');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    
    videoContainer.appendChild(iframe);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('modal');
    const videoContainer = document.getElementById('videoContainer');
    
    modal.classList.remove('active');
    videoContainer.innerHTML = '';
    document.body.style.overflow = 'auto';
}

// Sort and organize videos: regular videos first (wider), then shorts (taller)
function organizeVideos(videos) {
    // Separate regular videos and shorts
    const regularVideos = videos.filter(v => {
        const type = v.type?.toLowerCase();
        return type === 'video' || !type || (type !== 'shorts' && type !== 'short');
    });
    const shorts = videos.filter(v => {
        const type = v.type?.toLowerCase();
        return type === 'shorts' || type === 'short';
    });
    
    console.log('Organizing videos:', {
        total: videos.length,
        regular: regularVideos.length,
        shorts: shorts.length,
        firstRegular: regularVideos[0]?.id,
        firstShort: shorts[0]?.id
    });
    
    // Return regular videos first (wider), then shorts (taller)
    return [...regularVideos, ...shorts];
}

// Load videos from Firebase with fallback to hardcoded list
async function loadVideos() {
    const gallery = document.getElementById('gallery');
    
    try {
        const videosRef = collection(db, 'videos');
        const q = query(videosRef, orderBy('createdAt', 'asc')); // Changed to 'asc' to fix reverse order
        const querySnapshot = await getDocs(q);
        
        gallery.innerHTML = '';
        
        let videos = [];
        
        if (querySnapshot.empty) {
            // Use fallback videos if Firebase is empty
            console.log('Firebase is empty, using fallback videos');
            videos = FALLBACK_VIDEOS;
        } else {
            // Use videos from Firebase
            querySnapshot.forEach((doc) => {
                const video = { id: doc.id, ...doc.data() };
                videos.push(video);
            });
        }
        
        // Organize videos: regular videos first, then shorts
        const organizedVideos = organizeVideos(videos);
        
        // Create and append cards in organized order
        organizedVideos.forEach((video, index) => {
            const card = createVideoCard(video);
            card.setAttribute('data-order', index);
            gallery.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading videos from Firebase, using fallback:', error);
        // On error, use fallback videos
        gallery.innerHTML = '';
        const organizedVideos = organizeVideos(FALLBACK_VIDEOS);
        organizedVideos.forEach((video, index) => {
            const card = createVideoCard(video);
            card.setAttribute('data-order', index);
            gallery.appendChild(card);
        });
    }
}

// Check if user is authenticated and is admin
function isAdmin() {
    const user = auth.currentUser;
    return user && user.uid === ADMIN_UID;
}

// Delete video from Firebase
async function deleteVideo(video) {
    // Check authentication
    if (!isAdmin()) {
        alert('You must be logged in as admin to delete videos.');
        return;
    }
    
    try {
        // Find the document ID in Firebase
        const videosRef = collection(db, 'videos');
        const q = query(videosRef);
        const querySnapshot = await getDocs(q);
        
        let docId = null;
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.id === video.id) {
                docId = doc.id;
            }
        });
        
        if (docId) {
            await deleteDoc(doc(db, 'videos', docId));
            // Reload videos to update the gallery
            await loadVideos();
        } else {
            // If not found in Firebase, it might be a fallback video
            console.log('Video not found in Firebase, may be a fallback video');
            alert('Video not found in database. It may be a fallback video that cannot be deleted.');
        }
    } catch (error) {
        console.error('Error deleting video:', error);
        alert('Failed to delete video. Please try again.');
    }
}

// Update UI based on authentication state
function updateAuthUI(user) {
    const addVideoBtn = document.getElementById('addVideoBtn');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (user && user.uid === ADMIN_UID) {
        // User is authenticated and is admin
        addVideoBtn.style.display = 'block';
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
    } else {
        // User is not authenticated or not admin
        addVideoBtn.style.display = 'none';
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
    }
    
    // Update delete buttons on all video cards
    const deleteButtons = document.querySelectorAll('.delete-video-btn');
    deleteButtons.forEach(btn => {
        btn.style.display = (user && user.uid === ADMIN_UID) ? 'flex' : 'none';
    });
}

// Add video to Firebase
async function addVideo(url, title = '') {
    // Check authentication
    if (!isAdmin()) {
        throw new Error('You must be logged in as admin to add videos.');
    }
    
    const videoId = extractVideoId(url);
    
    if (!videoId) {
        throw new Error('Invalid YouTube URL. Please check the URL and try again.');
    }
    
    const type = detectVideoType(url);
    const videoData = {
        id: videoId,
        type: type,
        title: title || `Video ${videoId}`,
        url: url,
        createdAt: Timestamp.now()
    };
    
    try {
        await addDoc(collection(db, 'videos'), videoData);
        return true;
    } catch (error) {
        console.error('Error adding video:', error);
        throw new Error('Failed to add video. Please try again.');
    }
}

// Setup login form
function setupLoginForm() {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const cancelLoginBtn = document.getElementById('cancelLoginBtn');
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');
    
    // Open login modal
    loginBtn.addEventListener('click', () => {
        loginModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // Close login modal
    const closeLoginModalFunc = () => {
        loginModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        loginForm.reset();
        loginMessage.className = 'form-message';
        loginMessage.textContent = '';
    };
    
    closeLoginModal.addEventListener('click', closeLoginModalFunc);
    cancelLoginBtn.addEventListener('click', closeLoginModalFunc);
    
    loginModal.addEventListener('click', (e) => {
        if (e.target.id === 'loginModal') {
            closeLoginModalFunc();
        }
    });
    
    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
        loginMessage.className = 'form-message';
        loginMessage.textContent = '';
        
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            if (user.uid !== ADMIN_UID) {
                await signOut(auth);
                throw new Error('Access denied. This account is not authorized.');
            }
            
            loginMessage.className = 'form-message success';
            loginMessage.textContent = 'Login successful!';
            
            setTimeout(() => {
                closeLoginModalFunc();
            }, 1000);
            
        } catch (error) {
            console.error('Login error:', error);
            loginMessage.className = 'form-message error';
            
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                loginMessage.textContent = 'Invalid email or password.';
            } else if (error.code === 'auth/too-many-requests') {
                loginMessage.textContent = 'Too many failed attempts. Please try again later.';
            } else {
                loginMessage.textContent = error.message || 'Login failed. Please try again.';
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    });
}

// Setup logout
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
        }
    });
}

// Handle add video form
function setupAddVideoForm() {
    const addVideoBtn = document.getElementById('addVideoBtn');
    const addVideoModal = document.getElementById('addVideoModal');
    const closeAddModal = document.getElementById('closeAddModal');
    const cancelAddBtn = document.getElementById('cancelAddBtn');
    const addVideoForm = document.getElementById('addVideoForm');
    const formMessage = document.getElementById('formMessage');
    
    // Open modal
    addVideoBtn.addEventListener('click', () => {
        if (!isAdmin()) {
            alert('You must be logged in to add videos.');
            return;
        }
        addVideoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // Close modal
    const closeAddVideoModal = () => {
        addVideoModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        addVideoForm.reset();
        formMessage.className = 'form-message';
        formMessage.textContent = '';
    };
    
    closeAddModal.addEventListener('click', closeAddVideoModal);
    cancelAddBtn.addEventListener('click', closeAddVideoModal);
    
    addVideoModal.addEventListener('click', (e) => {
        if (e.target.id === 'addVideoModal') {
            closeAddVideoModal();
        }
    });
    
    // Handle form submission
    addVideoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const urlInput = document.getElementById('videoUrl');
        const titleInput = document.getElementById('videoTitle');
        const submitBtn = addVideoForm.querySelector('button[type="submit"]');
        
        const url = urlInput.value.trim();
        const title = titleInput.value.trim();
        
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding...';
        formMessage.className = 'form-message';
        formMessage.textContent = '';
        
        try {
            await addVideo(url, title);
            
            // Success
            formMessage.className = 'form-message success';
            formMessage.textContent = 'Video added successfully!';
            
            // Reload videos
            await loadVideos();
            
            // Close modal after a delay
            setTimeout(() => {
                closeAddVideoModal();
            }, 1500);
            
        } catch (error) {
            formMessage.className = 'form-message error';
            formMessage.textContent = error.message || 'Failed to add video. Please try again.';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Video';
        }
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadVideos();
    setupLoginForm();
    setupLogout();
    setupAddVideoForm();
    
    // Monitor authentication state
    onAuthStateChanged(auth, (user) => {
        updateAuthUI(user);
    });
    
    // Close video modal
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target.id === 'modal') {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            const addVideoModal = document.getElementById('addVideoModal');
            const loginModal = document.getElementById('loginModal');
            
            if (addVideoModal.classList.contains('active')) {
                addVideoModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
            if (loginModal.classList.contains('active')) {
                loginModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        }
    });
});
