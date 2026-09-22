import urllib.request
import json
import os
import sys

tiktok_url = "https://www.tiktok.com/@eichpqw/video/7648101467630439694"
api_url = f"https://www.tikwm.com/api/?url={tiktok_url}"

req = urllib.request.Request(api_url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        print("API code:", res.get("code"))
        data = res.get("data", {})
        play_url = data.get("play") or data.get("wmplay")
        cover_url = data.get("cover")
        print("Play URL:", play_url)
        print("Cover URL:", cover_url)
        
        if play_url:
            os.makedirs("public/videos", exist_ok=True)
            video_dest = "public/videos/stabilisateur-demo.mp4"
            print("Downloading video to", video_dest, "...")
            vreq = urllib.request.Request(play_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(vreq) as vresp, open(video_dest, "wb") as f:
                f.write(vresp.read())
            print("Video downloaded successfully! Size:", os.path.getsize(video_dest), "bytes")
            
        if cover_url:
            cover_dest = "public/images/stabilisateur-video-poster.jpg"
            print("Downloading poster to", cover_dest, "...")
            creq = urllib.request.Request(cover_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(creq) as cresp, open(cover_dest, "wb") as f:
                f.write(cresp.read())
            print("Poster downloaded successfully! Size:", os.path.getsize(cover_dest), "bytes")
except Exception as e:
    print("Error:", e, file=sys.stderr)
