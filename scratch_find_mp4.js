const https = require('https');
const http = require('http');
const fs = require('fs');
const { execSync } = require('child_process');

const REEL_URL = 'https://www.instagram.com/reel/DXeQ96bjBhy/';

function curlPost(url, body, referer) {
  try {
    const bodyEscaped = body.replace(/"/g, '\\"');
    const cmd = `curl.exe -s -L --max-time 20 -X POST "${url}" -H "Content-Type: application/x-www-form-urlencoded" -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0" -H "Referer: ${referer}" -H "Origin: ${new URL(referer).origin}" -d "${bodyEscaped}"`;
    console.log('Running curl for:', url);
    const result = execSync(cmd, { timeout: 25000, encoding: 'utf8' });
    return result;
  } catch(e) {
    return e.stdout || e.message;
  }
}

function curlGet(url) {
  try {
    const cmd = `curl.exe -s -L --max-time 20 "${url}" -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"`;
    return execSync(cmd, { timeout: 25000, encoding: 'utf8' });
  } catch(e) {
    return e.stdout || e.message;
  }
}

function findVideoUrls(text) {
  const urls = text.match(/https?:[^\s"'<>\\]+\.(mp4|m3u8|video)[^\s"'<>\\]*/gi) || [];
  const fbcdn = text.match(/https?:[^\s"'<>\\]+fbcdn[^\s"'<>\\]+/gi) || [];
  return [...new Set([...urls, ...fbcdn])];
}

async function main() {
  // 1. Try sssinstagram
  console.log('\n=== sssinstagram.com ===');
  const sss = curlPost('https://sssinstagram.com/api/convert', 
    `url=${encodeURIComponent(REEL_URL)}`,
    'https://sssinstagram.com/'
  );
  console.log('Response (500):', sss.substring(0, 500));
  console.log('Video URLs:', findVideoUrls(sss));

  // 2. Try igdownloader
  console.log('\n=== igdownloader.app ===');
  const igd = curlPost('https://igdownloader.app/api/ajaxSearch',
    `q=${encodeURIComponent(REEL_URL)}&t=media&lang=en`,
    'https://igdownloader.app/'
  );
  console.log('Response (500):', igd.substring(0, 500));
  console.log('Video URLs:', findVideoUrls(igd));

  // 3. Try fastdl
  console.log('\n=== fastdl.app ===');
  const fastdl = curlPost('https://fastdl.app/api/convert',
    `url=${encodeURIComponent(REEL_URL)}`,
    'https://fastdl.app/'
  );
  console.log('Response (500):', fastdl.substring(0, 500));
  console.log('Video URLs:', findVideoUrls(fastdl));

  // 4. Try reeldownloader - direct GET approach
  console.log('\n=== reeldownloader.net ===');
  const reeld = curlGet(`https://reeldownloader.net/?url=${encodeURIComponent(REEL_URL)}`);
  console.log('Response (300):', reeld.substring(0, 300));
  console.log('Video URLs:', findVideoUrls(reeld));
}

main();
