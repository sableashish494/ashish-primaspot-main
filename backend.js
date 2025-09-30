const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

const BASE_URL = "https://www.instagram.com/api/v1/users/web_profile_info/?username=";

function getHeaders(username) {
  return {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Cookie": `sessionid=${process.env.INSTAGRAM_SESSIONID || ""};`,
    "Referer": `https://www.instagram.com/${username}/`,
    "X-Requested-With": "XMLHttpRequest",
    "X-IG-App-ID": "936619743392459"
  };
}

// ---------------- Helper Functions ----------------

// Clear old JSON files
function clearOldFiles() {
  const files = ["profile.json", "posts.json", "reels.json"];
  files.forEach(file => {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  });
}

// Save JSON data to file
function saveToFile(filename, data) {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`✅ Saved ${filename}`);
}

// Fetch raw user data from Instagram API
async function fetchUserData(username) {
  const url = `${BASE_URL}${username}`;
  const res = await axios.get(url, { headers: getHeaders(username) });
  return res.data.data.user;
}

// Fetch profile details
async function getProfile(username) {
  const user = await fetchUserData(username);
  return {
    username: user.username,
    full_name: user.full_name,
    bio: user.biography,
    profile_picture: user.profile_pic_url_hd,
    posts: user.edge_owner_to_timeline_media.count,
    followers: user.edge_followed_by.count,
    following: user.edge_follow.count
  };
}

// Fetch exactly N posts (excluding reels)
async function getPosts(username, n = 10) {
  const user = await fetchUserData(username);
  const posts = user.edge_owner_to_timeline_media.edges
    .filter(edge => edge.node.product_type !== "clips") // only posts
    .slice(0, n)
    .map(edge => ({
      id: edge.node.id,
      shortcode: edge.node.shortcode,
      caption: edge.node.edge_media_to_caption.edges[0]?.node.text || "",
      thumbnail: edge.node.display_url,
      is_video: edge.node.is_video,
      product_type: edge.node.product_type,
      likes: edge.node.edge_liked_by.count,
      comments: edge.node.edge_media_to_comment.count,
      post_url: `https://www.instagram.com/p/${edge.node.shortcode}/`
    }));
  return posts;
}

// Fetch exactly M reels (clips only)
async function getReels(username, m = 5) {
  const user = await fetchUserData(username);
  const reels = user.edge_owner_to_timeline_media.edges
    .filter(edge => edge.node.product_type === "clips") // only reels
    .slice(0, m)
    .map(edge => ({
      id: edge.node.id,
      shortcode: edge.node.shortcode,
      caption: edge.node.edge_media_to_caption.edges[0]?.node.text || "",
      thumbnail: edge.node.display_url,
      is_video: edge.node.is_video,
      product_type: edge.node.product_type,
      likes: edge.node.edge_liked_by.count,
      comments: edge.node.edge_media_to_comment.count,
      post_url: `https://www.instagram.com/p/${edge.node.shortcode}/`
    }));
  return reels;
}

// ---------------- Main ----------------
(async () => {
  const username = process.argv[2];
  if (!username) {
    console.error("Usage: node getUserInfo.js <instagram-username>");
    process.exit(1);
  }

  try {
    // Clear old files first
    clearOldFiles();

    console.log(`🚀 Fetching Instagram data for: ${username}`);

    const profile = await getProfile(username);
    const posts = await getPosts(username, 15); // fetch 15 posts
    const reels = await getReels(username, 7);  // fetch 7 reels

    // Save new data
    saveToFile("profile.json", profile);
    saveToFile("posts.json", posts);
    saveToFile("reels.json", reels);

    console.log(`🎉 Done! Data saved for ${username}`);
  } catch (err) {
    console.error("[ERROR] Failed to fetch data:", err.response?.status, err.message);
  }
})();
