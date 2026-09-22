const fs = require('fs');
const https = require('https');
const path = require('path');

const tiktokUrl = "https://www.tiktok.com/@eichpqw/video/7648101467630439694";
const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}`;

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log("Fetching video info from tikwm API...");
  const json = await fetchJson(apiUrl);
  console.log("Response code:", json.code);
  const data = json.data || {};
  const playUrl = data.play || data.wmplay;
  const coverUrl = data.cover;

  console.log("Play URL:", playUrl);
  console.log("Cover URL:", coverUrl);

  if (playUrl) {
    fs.mkdirSync(path.join(__dirname, 'public/videos'), { recursive: true });
    const videoDest = path.join(__dirname, 'public/videos/stabilisateur-demo.mp4');
    console.log("Downloading video to", videoDest, "...");
    await downloadFile(playUrl, videoDest);
    const stats = fs.statSync(videoDest);
    console.log("Video downloaded! Size:", stats.size, "bytes");
  }

  if (coverUrl) {
    fs.mkdirSync(path.join(__dirname, 'public/images'), { recursive: true });
    const coverDest = path.join(__dirname, 'public/images/stabilisateur-video-poster.jpg');
    console.log("Downloading poster to", coverDest, "...");
    await downloadFile(coverUrl, coverDest);
    const stats = fs.statSync(coverDest);
    console.log("Poster downloaded! Size:", stats.size, "bytes");
  }
}

main().catch(err => console.error("Error:", err));
