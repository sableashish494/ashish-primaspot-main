function validateUsername(username) {
    if (!username) {
        throw new Error('Username cannot be empty');
    }
    if (username.length > 30) {
        throw new Error('Username too long (max 30 characters)');
    }
    if (!/^[a-zA-Z0-9._]+$/.test(username)) {
        throw new Error('Username can only contain letters, numbers, dots, and underscores');
    }
    return username;
}

// Utility function to handle image URLs (proxy)
function getProxyUrl(originalUrl) {
    if (!originalUrl) return '';
    // Encode the URL to handle special characters
    const encodedUrl = encodeURIComponent(originalUrl);
    return `/api/image?url=${encodedUrl}`;
}
// Utility function to format numbers (e.g., 1200 → 1.2K, 1500000 → 1.5M)
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}
function createPostCard(post, isReel = false) {
    const card = document.createElement('div');
    card.className = 'post-card';
    
    const typeLabel = isReel ? 'REEL' : 'POST';
    
    card.innerHTML = `
        <img src="${getProxyUrl(post.thumbnail)}" alt="Post thumbnail" class="post-image" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDI4MCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNDAgMTAwTDEyMCA4MEwxNjAgODBMMTQwIDEwMFoiIGZpbGw9IiNDQ0NDQ0MiLz4KPHN2Zz4K'">
        <div class="post-content">
            <p class="post-caption">${post.caption || 'No caption'}</p>
            <div class="post-stats">
                <span>❤️ ${formatNumber(post.likes)}</span>
                <span>💬 ${formatNumber(post.comments)}</span>
            </div>
        </div>
    `;
    
    // Open post in new tab on click
    card.addEventListener('click', () => {
        window.open(post.post_url, '_blank');
    });
    
    return card;
}
function calculateAnalytics(posts, reels, profile) {
    const allContent = [...posts, ...reels];
    
    // Posts analytics
    const postsAnalytics = calculateContentAnalytics(posts, 'Posts');
    
    // Reels analytics
    const reelsAnalytics = calculateContentAnalytics(reels, 'Reels');
    
    // Overall analytics
    const totalLikes = allContent.reduce((sum, item) => sum + item.likes, 0);
    const totalComments = allContent.reduce((sum, item) => sum + item.comments, 0);
    const avgLikes = allContent.length > 0 ? Math.round(totalLikes / allContent.length) : 0;
    const avgComments = allContent.length > 0 ? Math.round(totalComments / allContent.length) : 0;
    
    // Engagement rate
    const totalEngagement = totalLikes + totalComments;
    const engagementRate = profile.followers > 0 ? ((totalEngagement / allContent.length) / profile.followers * 100) : 0;
    
    return {
        posts: postsAnalytics,
        reels: reelsAnalytics,
        overall: {
            totalPosts: posts.length,
            totalReels: reels.length,
            totalContent: allContent.length,
            avgLikes,
            avgComments,
            totalLikes,
            totalComments,
            engagementRate: Math.round(engagementRate * 100) / 100
        }
    };
}
function calculateContentAnalytics(content, type) {
    if (content.length === 0) {
        return {
            count: 0,
            avgLikes: 0,
            avgComments: 0,
            totalLikes: 0,
            totalComments: 0,
            bestPerforming: null,
            engagementRate: 0
        };
    }
    
    const totalLikes = content.reduce((sum, item) => sum + item.likes, 0);
    const totalComments = content.reduce((sum, item) => sum + item.comments, 0);
    const avgLikes = Math.round(totalLikes / content.length);
    const avgComments = Math.round(totalComments / content.length);
    
    // Find best performing content
    const bestPerforming = content.reduce((best, current) => {
        const currentEngagement = current.likes + current.comments;
        const bestEngagement = best.likes + best.comments;
        return currentEngagement > bestEngagement ? current : best;
    });
    
    return {
        count: content.length,
        avgLikes,
        avgComments,
        totalLikes,
        totalComments,
        bestPerforming,
        engagementRate: Math.round((totalLikes + totalComments) / content.length)
    };
}
function createSummaryCard(analytics) {
    const card = document.createElement('div');
    card.className = 'analytics-card analytics-summary';
    
    card.innerHTML = `
        <h4>📊 Profile Summary</h4>
        <div class="summary-stats">
            <div class="summary-stat">
                <div class="summary-stat-value">${analytics.overall.totalContent}</div>
                <div class="summary-stat-label">Total Content</div>
            </div>
            <div class="summary-stat">
                <div class="summary-stat-value">${formatNumber(analytics.overall.avgLikes)}</div>
                <div class="summary-stat-label">Avg Likes</div>
            </div>
            <div class="summary-stat">
                <div class="summary-stat-value">${formatNumber(analytics.overall.avgComments)}</div>
                <div class="summary-stat-label">Avg Comments</div>
            </div>
            <div class="summary-stat">
                <div class="summary-stat-value">${analytics.overall.engagementRate}%</div>
                <div class="summary-stat-label">Engagement Rate</div>
            </div>
        </div>
    `;
    
    return card;
}


function createPostsAnalyticsCard(postsAnalytics) {
    const card = document.createElement('div');
    card.className = 'analytics-card';
    
    card.innerHTML = `
        <h4>📸 Posts Analytics</h4>
        <div class="metric">
            <span class="metric-label">Total Posts</span>
            <span class="metric-value">${postsAnalytics.count}</span>
        </div>
        <div class="metric">
            <span class="metric-label">Average Likes</span>
            <span class="metric-value">${formatNumber(postsAnalytics.avgLikes)}</span>
        </div>
        <div class="metric">
            <span class="metric-label">Average Comments</span>
            <span class="metric-value">${formatNumber(postsAnalytics.avgComments)}</span>
        </div>
        <div class="metric">
            <span class="metric-label">Total Engagement</span>
            <span class="metric-value">${formatNumber(postsAnalytics.totalLikes + postsAnalytics.totalComments)}</span>
        </div>
    `;
    
    return card;
}




function createReelsAnalyticsCard(reelsAnalytics) {
    const card = document.createElement('div');
    card.className = 'analytics-card';
    
    card.innerHTML = `
        <h4>🎬 Reels Analytics</h4>
        <div class="metric">
            <span class="metric-label">Total Reels</span>
            <span class="metric-value">${reelsAnalytics.count}</span>
        </div>
        <div class="metric">
            <span class="metric-label">Average Likes</span>
            <span class="metric-value">${formatNumber(reelsAnalytics.avgLikes)}</span>
        </div>
        <div class="metric">
            <span class="metric-label">Average Comments</span>
            <span class="metric-value">${formatNumber(reelsAnalytics.avgComments)}</span>
        </div>
        <div class="metric">
            <span class="metric-label">Total Engagement</span>
            <span class="metric-value">${formatNumber(reelsAnalytics.totalLikes + reelsAnalytics.totalComments)}</span>
        </div>
    `;
    
    return card;
}
function createEngagementCard(analytics) {
    const card = document.createElement('div');
    card.className = 'analytics-card';
    
    const totalEngagement = analytics.overall.totalLikes + analytics.overall.totalComments;
    const postsEngagement = analytics.posts.totalLikes + analytics.posts.totalComments;
    const reelsEngagement = analytics.reels.totalLikes + analytics.reels.totalComments;
    
    card.innerHTML = `
        <h4>💡 Engagement Insights</h4>
        <div class="metric">
            <span class="metric-label">Total Likes</span>
            <span class="metric-value">${formatNumber(analytics.overall.totalLikes)}</span>
        </div>
        <div class="metric">
            <span class="metric-label">Total Comments</span>
            <span class="metric-value">${formatNumber(analytics.overall.totalComments)}</span>
        </div>
        <div class="metric">
            <span class="metric-label">Posts Engagement</span>
            <span class="metric-value">${formatNumber(postsEngagement)}</span>
        </div>
        <div class="metric">
            <span class="metric-label">Reels Engagement</span>
            <span class="metric-value">${formatNumber(reelsEngagement)}</span>
        </div>
    `;
    
    return card;
}

// Function to create analytics graphs
function createAnalyticsGraphs(analytics, posts, reels) {
    // Likes vs Comments chart
    createLikesCommentsChart(analytics);

    // If you want, you can uncomment and add other charts later
    // createEngagementChart(analytics);
    // createContentTypeChart(analytics);
    // createEngagementOverTimeChart(posts, reels);
}

// Likes vs Comments chart
function createLikesCommentsChart(analytics) {
    const container = document.createElement('div');
    container.className = 'graph-container';
    
    container.innerHTML = `
        <h4>❤️ Likes vs Comments</h4>
        <div class="graph-wrapper">
            <canvas id="likesCommentsChart"></canvas>
        </div>
    `;
    
    analyticsGraphs.appendChild(container);
    
    const ctx = document.getElementById('likesCommentsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Posts', 'Reels'],
            datasets: [
                {
                    label: 'Likes',
                    data: [analytics.posts.totalLikes, analytics.reels.totalLikes],
                    backgroundColor: '#667eea',
                    borderRadius: 4
                },
                {
                    label: 'Comments',
                    data: [analytics.posts.totalComments, analytics.reels.totalComments],
                    backgroundColor: '#764ba2',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f0f0f0'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Tab switch functions
function switchToPosts() {
    postsTab.classList.add('active');
    reelsTab.classList.remove('active');
    analyticsTab.classList.remove('active');
    postsSection.classList.add('active');
    reelsSection.classList.remove('active');
    analyticsSection.classList.remove('active');
}

function switchToReels() {
    reelsTab.classList.add('active');
    postsTab.classList.remove('active');
    analyticsTab.classList.remove('active');
    reelsSection.classList.add('active');
    postsSection.classList.remove('active');
    analyticsSection.classList.remove('active');
}

function switchToAnalytics() {
    analyticsTab.classList.add('active');
    postsTab.classList.remove('active');
    reelsTab.classList.remove('active');
    analyticsSection.classList.add('active');
    postsSection.classList.remove('active');
    reelsSection.classList.remove('active');
}

// DOM Elements
const usernameForm = document.getElementById('usernameForm');
const usernameInput = document.getElementById('usernameInput');
const fetchBtn = document.getElementById('fetchBtn');
const fetchFromDbBtn = document.getElementById('fetchFromDbBtn');
const loadingSection = document.getElementById('loadingSection');
const errorSection = document.getElementById('errorSection');
const profileSection = document.getElementById('profileSection');

// Profile elements
const profileImage = document.getElementById('profileImage');
const profileName = document.getElementById('profileName');
const profileUsername = document.getElementById('profileUsername');
const profileBio = document.getElementById('profileBio');
const postsCount = document.getElementById('postsCount');
const followersCount = document.getElementById('followersCount');
const followingCount = document.getElementById('followingCount');

// 🔹 EDITED: Profile Summary fields
const totalLikesEl = document.getElementById('totalLikes');
const totalCommentsEl = document.getElementById('totalComments');
const avgLikesEl = document.getElementById('avgLikes');
const avgCommentsEl = document.getElementById('avgComments');
const engagementRateEl = document.getElementById('engagementRate');

// Toggle elements
const postsTab = document.getElementById('postsTab');
const reelsTab = document.getElementById('reelsTab');
const analyticsTab = document.getElementById('analyticsTab');
const postsSection = document.getElementById('postsSection');
const reelsSection = document.getElementById('reelsSection');
const analyticsSection = document.getElementById('analyticsSection');
const postsGrid = document.getElementById('postsGrid');
const reelsGrid = document.getElementById('reelsGrid');
const analyticsContent = document.getElementById('analyticsContent');
const analyticsGraphs = document.getElementById('analyticsGraphs');

// State management
let currentData = {
    profile: null,
    posts: [],
    reels: []
};

// Utility Functions
function showLoading() {
    loadingSection.style.display = 'block';
    errorSection.style.display = 'none';
    profileSection.style.display = 'none';
    fetchBtn.disabled = true;
    fetchBtn.querySelector('.btn-text').style.display = 'none';
    fetchBtn.querySelector('.loading-spinner').style.display = 'inline';
}

function hideLoading() {
    loadingSection.style.display = 'none';
    fetchBtn.disabled = false;
    fetchBtn.querySelector('.btn-text').style.display = 'inline';
    fetchBtn.querySelector('.loading-spinner').style.display = 'none';
}

function showError(message) {
    hideLoading();
    errorSection.style.display = 'block';
    profileSection.style.display = 'none';
    document.getElementById('errorMessage').textContent = message;
}

function clearError() {
    errorSection.style.display = 'none';
}

function showProfile() {
    hideLoading();
    errorSection.style.display = 'none';
    profileSection.style.display = 'block';
}

// Backend Integration
async function fetchProfileData(username) {
    try {
        showLoading();
        
        const response = await fetch('/api/fetch-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: username })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        return data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
}

// Database Integration
async function fetchProfileFromDatabase(username) {
    try {
        showLoading();
        
        const response = await fetch(`/api/db/user/${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching from database:', error);
        throw error;
    }
}

// Alternative method: Direct file reading (for local development)
async function fetchProfileDataLocal(username) {
    try {
        showLoading();
        
        const [profileResponse, postsResponse, reelsResponse] = await Promise.all([
            fetch(`./profile.json?t=${Date.now()}`),
            fetch(`./posts.json?t=${Date.now()}`),
            fetch(`./reels.json?t=${Date.now()}`)
        ]);

        if (!profileResponse.ok || !postsResponse.ok || !reelsResponse.ok) {
            throw new Error('Failed to load profile data. Make sure the backend script has been run.');
        }

        const profile = await profileResponse.json();
        const posts = await postsResponse.json();
        const reels = await reelsResponse.json();

        return { profile, posts, reels };
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
}

// Profile Display Functions
function displayProfile(profile) {
    profileImage.src = getProxyUrl(profile.profile_picture);
    profileImage.alt = `${profile.username}'s profile picture`;
    profileImage.onerror = function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNjAiIHI9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNjAiIHI9IjQwIiBmaWxsPSIjQ0NDQ0NDIi8+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNjAiIHI9IjIwIiBmaWxsPSIjOTk5OTk5Ii8+Cjwvc3ZnPgo=';
    };
    profileName.textContent = profile.full_name || profile.username;
    profileUsername.textContent = `@${profile.username}`;
    profileBio.textContent = profile.bio || 'No bio available';
    postsCount.textContent = formatNumber(profile.posts);
    followersCount.textContent = formatNumber(profile.followers);
    followingCount.textContent = formatNumber(profile.following);
}

function displayPosts(posts) {
    postsGrid.innerHTML = '';
    
    if (posts.length === 0) {
        postsGrid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1 / -1;">No posts found</p>';
        return;
    }

    posts.forEach(post => {
        const postCard = createPostCard(post);
        postsGrid.appendChild(postCard);
    });
}

function displayReels(reels) {
    reelsGrid.innerHTML = '';
    
    if (reels.length === 0) {
        reelsGrid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1 / -1;">No reels found</p>';
        return;
    }

    reels.forEach(reel => {
        const reelCard = createPostCard(reel, true);
        reelsGrid.appendChild(reelCard);
    });
}

function displayAnalytics(profile, posts, reels) {
    analyticsContent.innerHTML = '';
    analyticsGraphs.innerHTML = '';
    
    // Calculate analytics
    const analytics = calculateAnalytics(posts, reels, profile);

    // 🔹 EDITED: Push summary values into the Profile Summary card
    totalLikesEl.textContent = analytics.overall.totalLikes;
    totalCommentsEl.textContent = analytics.overall.totalComments;
    avgLikesEl.textContent = analytics.overall.avgLikes;
    avgCommentsEl.textContent = analytics.overall.avgComments;
    engagementRateEl.textContent = analytics.overall.engagementRate + "%";
    
    // Create summary card
    const summaryCard = createSummaryCard(analytics);
    analyticsContent.appendChild(summaryCard);
    
    // Create posts analytics card
    const postsCard = createPostsAnalyticsCard(analytics.posts);
    analyticsContent.appendChild(postsCard);
    
    // Create reels analytics card
    const reelsCard = createReelsAnalyticsCard(analytics.reels);
    analyticsContent.appendChild(reelsCard);
    
    // Create engagement card
    const engagementCard = createEngagementCard(analytics);
    analyticsContent.appendChild(engagementCard);
    
    // Create graphs
    createAnalyticsGraphs(analytics, posts, reels);
}

// ... rest of your existing functions remain unchanged (createPostCard, switchToPosts, etc.)

// Event Listeners
usernameForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const username = validateUsername(usernameInput.value.trim());
        
        let data;
        try {
            data = await fetchProfileData(username);
        } catch (apiError) {
            console.log('API failed, trying local files...');
            data = await fetchProfileDataLocal(username);
        }
        
        currentData = data;
        
        displayProfile(data.profile);
        displayPosts(data.posts);
        displayReels(data.reels);
        displayAnalytics(data.profile, data.posts, data.reels);
        
        showProfile();
        switchToPosts();
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Failed to fetch profile data. Please check the username and try again.');
    }
});

postsTab.addEventListener('click', switchToPosts);
reelsTab.addEventListener('click', switchToReels);
analyticsTab.addEventListener('click', switchToAnalytics);

fetchFromDbBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    try {
        const username = validateUsername(usernameInput.value.trim());
        const data = await fetchProfileFromDatabase(username);
        
        currentData = data;
        
        displayProfile(data.profile);
        displayPosts(data.posts);
        displayReels(data.reels);
        displayAnalytics(data.profile, data.posts, data.reels);
        
        showProfile();
        switchToPosts();
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Failed to fetch profile data from database. User might not exist in database.');
    }
});

usernameInput.addEventListener('input', () => {
    if (errorSection.style.display !== 'none') {
        clearError();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    usernameInput.focus();
    
    const placeholders = [
        'Enter Instagram username (without @)',
        'Try: cristiano, selenagomez, therock',
        'Enter username to view profile'
    ];
    
    let placeholderIndex = 0;
    setInterval(() => {
        if (document.activeElement !== usernameInput) {
            usernameInput.placeholder = placeholders[placeholderIndex];
            placeholderIndex = (placeholderIndex + 1) % placeholders.length;
        }
    }, 3000);
});

window.clearError = clearError;

// 🔹 EDITED: Removed duplicate summary updates from loadAnalytics() since displayAnalytics handles them
async function loadAnalytics() {
    try {
        const response = await fetch('/api/getAnalytics');
        const data = await response.json();

        drawPostChart(data.postAnalytics.posts);
        drawReelsChart(data.reelsAnalytics.reels);
        drawEngagementChart(data.engagement);

    } catch (error) {
        console.error("Error loading analytics:", error);
    }
}

window.onload = loadAnalytics;
