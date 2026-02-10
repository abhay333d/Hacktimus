import urllib.request
import os
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

base_dir = r"d:\Hacktimus\chaser-agent\client\public\earth"
os.makedirs(base_dir, exist_ok=True)

urls = {
    "day.jpg": "https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg",
    "night.jpg": "https://www.solarsystemscope.com/textures/download/2k_earth_nightmap.jpg",
    "specularClouds.jpg": "https://www.solarsystemscope.com/textures/download/2k_earth_clouds.jpg",
    "stars.jpg": "https://www.solarsystemscope.com/textures/download/2k_stars_milky_way.jpg"
}

user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
headers = {'User-Agent': user_agent}

for filename, url in urls.items():
    print(f"Attempting to download {filename} from {url}...")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            data = response.read()
            if len(data) > 1000: # Basic check
                with open(os.path.join(base_dir, filename), 'wb') as out_file:
                    out_file.write(data)
                print(f"Successfully downloaded {filename} ({len(data)} bytes)")
            else:
                print(f"Failed (too small): {filename}")
    except Exception as e:
        print(f"Error downloading {filename}: {e}")
