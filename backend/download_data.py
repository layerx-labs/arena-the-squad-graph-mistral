#!/usr/bin/env python3
"""
Download the dataset from CDN and save locally
"""

import os
import json
import requests
from pathlib import Path


def download_data():
    """Download players.json and gaps.json from CDN"""
    
    data_dir = Path("data")
    data_dir.mkdir(parents=True, exist_ok=True)
    
    # CDN URLs
    players_url = "https://cdn.jsdelivr.net/gh/layerx-labs/wc2026-squad-graph-dataset@afb888ebc3b806e395823a18988ee112046b65a8/players.json"
    gaps_url = "https://cdn.jsdelivr.net/gh/layerx-labs/wc2026-squad-graph-dataset@afb888ebc3b806e395823a18988ee112046b65a8/gaps.json"
    
    print("Downloading players.json...")
    try:
        response = requests.get(players_url, timeout=60)
        response.raise_for_status()
        
        players_data = response.json()
        
        # Save to file
        with open(data_dir / "players.json", "w", encoding="utf-8") as f:
            json.dump(players_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Downloaded players.json ({len(players_data.get('players', []))} players, {len(players_data.get('clubs', []))} clubs)")
        
    except Exception as e:
        print(f"❌ Error downloading players.json: {e}")
        return False
    
    print("Downloading gaps.json...")
    try:
        response = requests.get(gaps_url, timeout=60)
        response.raise_for_status()
        
        gaps_data = response.json()
        
        # Save to file
        with open(data_dir / "gaps.json", "w", encoding="utf-8") as f:
            json.dump(gaps_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Downloaded gaps.json")
        
    except Exception as e:
        print(f"❌ Error downloading gaps.json: {e}")
        return False
    
    return True


if __name__ == "__main__":
    success = download_data()
    if success:
        print("\n🎉 All data downloaded successfully!")
    else:
        print("\n❌ Some data failed to download")
        exit(1)
