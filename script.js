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
        
        // Call the backend script
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
        
        // Simulate backend call by reading the generated JSON files
        // In a real implementation, you'd call your backend script
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
    
    // Add click handler to open post
    card.addEventListener('click', () => {
        window.open(post.post_url, '_blank');
    });
    
    return card;
}

// Toggle Functions
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

// Utility Functions
function getProxyUrl(originalUrl) {
    if (!originalUrl) return '';
    // Encode the URL to handle special characters
    const encodedUrl = encodeURIComponent(originalUrl);
    return `/api/image?url=${encodedUrl}`;
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function validateUsername(username) {
    // Remove @ if present
    username = username.replace('@', '');
    
    // Basic validation
    if (!username || username.length < 1) {
        throw new Error('Please enter a valid username');
    }
    
    if (username.length > 30) {
        throw new Error('Username is too long');
    }
    
    // Check for valid characters (letters, numbers, dots, underscores)
    if (!/^[a-zA-Z0-9._]+$/.test(username)) {
        throw new Error('Username contains invalid characters');
    }
    
    return username;
}

// Analytics Functions
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
    
    // Engagement rate (simplified)
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

// Graph Functions
function createAnalyticsGraphs(analytics, posts, reels) {
    // Create engagement comparison chart
    createEngagementChart(analytics);
    
    // Create likes vs comments chart
    createLikesCommentsChart(analytics);
    
    // Create posts vs reels performance chart
    createContentTypeChart(analytics);
    
    // Create engagement over time chart (if we have enough data)
    if (posts.length > 1 || reels.length > 1) {
        createEngagementOverTimeChart(posts, reels);
    }
}

function createEngagementChart(analytics) {
    const container = document.createElement('div');
    container.className = 'graph-container';
    
    container.innerHTML = `
        <h4>📊 Engagement Comparison</h4>
        <div class="graph-wrapper">
            <canvas id="engagementChart"></canvas>
        </div>
    `;
    
    analyticsGraphs.appendChild(container);
    
    const ctx = document.getElementById('engagementChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Posts', 'Reels'],
            datasets: [{
                data: [
                    analytics.posts.totalLikes + analytics.posts.totalComments,
                    analytics.reels.totalLikes + analytics.reels.totalComments
                ],
                backgroundColor: ['#667eea', '#764ba2'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

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

function createContentTypeChart(analytics) {
    const container = document.createElement('div');
    container.className = 'graph-container';
    
    container.innerHTML = `
        <h4>📈 Content Performance</h4>
        <div class="graph-wrapper">
            <canvas id="contentTypeChart"></canvas>
        </div>
    `;
    
    analyticsGraphs.appendChild(container);
    
    const ctx = document.getElementById('contentTypeChart').getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Avg Likes', 'Avg Comments', 'Total Content', 'Engagement Rate'],
            datasets: [
                {
                    label: 'Posts',
                    data: [
                        analytics.posts.avgLikes,
                        analytics.posts.avgComments,
                        analytics.posts.count,
                        analytics.posts.engagementRate
                    ],
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    borderColor: '#667eea',
                    borderWidth: 2,
                    pointBackgroundColor: '#667eea'
                },
                {
                    label: 'Reels',
                    data: [
                        analytics.reels.avgLikes,
                        analytics.reels.avgComments,
                        analytics.reels.count,
                        analytics.reels.engagementRate
                    ],
                    backgroundColor: 'rgba(118, 75, 162, 0.2)',
                    borderColor: '#764ba2',
                    borderWidth: 2,
                    pointBackgroundColor: '#764ba2'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    grid: {
                        color: '#f0f0f0'
                    },
                    pointLabels: {
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

function createEngagementOverTimeChart(posts, reels) {
    const container = document.createElement('div');
    container.className = 'graph-container';
    
    container.innerHTML = `
        <h4>📅 Engagement Over Time</h4>
        <div class="graph-wrapper">
            <canvas id="engagementOverTimeChart"></canvas>
        </div>
    `;
    
    analyticsGraphs.appendChild(container);
    
    // Combine and sort all content by engagement
    const allContent = [...posts, ...reels].sort((a, b) => {
        const aEngagement = a.likes + a.comments;
        const bEngagement = b.likes + b.comments;
        return bEngagement - aEngagement;
    });
    
    const labels = allContent.map((_, index) => `Post ${index + 1}`);
    const likesData = allContent.map(item => item.likes);
    const commentsData = allContent.map(item => item.comments);
    
    const ctx = document.getElementById('engagementOverTimeChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Likes',
                    data: likesData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Comments',
                    data: commentsData,
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
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

// Event Listeners
usernameForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const username = validateUsername(usernameInput.value.trim());
        
        // Try to fetch data (first try API, then fallback to local files)
        let data;
        try {
            data = await fetchProfileData(username);
        } catch (apiError) {
            console.log('API failed, trying local files...');
            data = await fetchProfileDataLocal(username);
        }
        
        // Store data
        currentData = data;
        
        // Display profile
        displayProfile(data.profile);
        displayPosts(data.posts);
        displayReels(data.reels);
        displayAnalytics(data.profile, data.posts, data.reels);
        
        showProfile();
        
        // Switch to posts tab by default
        switchToPosts();
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Failed to fetch profile data. Please check the username and try again.');
    }
});

// Toggle event listeners
postsTab.addEventListener('click', switchToPosts);
reelsTab.addEventListener('click', switchToReels);
analyticsTab.addEventListener('click', switchToAnalytics);

// Database fetch button
fetchFromDbBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    try {
        const username = validateUsername(usernameInput.value.trim());
        
        // Fetch data from database
        const data = await fetchProfileFromDatabase(username);
        
        // Store data
        currentData = data;
        
        // Display profile
        displayProfile(data.profile);
        displayPosts(data.posts);
        displayReels(data.reels);
        displayAnalytics(data.profile, data.posts, data.reels);
        
        showProfile();
        
        // Switch to posts tab by default
        switchToPosts();
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Failed to fetch profile data from database. User might not exist in database.');
    }
});

// Clear error when user starts typing
usernameInput.addEventListener('input', () => {
    if (errorSection.style.display !== 'none') {
        clearError();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Focus on input
    usernameInput.focus();
    
    // Add some helpful placeholder text
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

// Export functions for global access
window.clearError = clearError;
