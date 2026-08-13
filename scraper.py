import requests
from bs4 import BeautifulSoup
import json

URL = "https://www.colorhexa.com/color-names"

response = requests.get(URL)
response.raise_for_status()

soup = BeautifulSoup(response.text, "html.parser")

colors = {}

# Find the colour table
table = soup.find("table")

if not table:
    raise Exception("Could not find the colour table.")

for row in table.find_all("tr"):
    cells = row.find_all("td")

    if len(cells) < 2:
        continue

    # First cell = colour name
    name = cells[0].get_text(" ", strip=True)

    # Second cell contains the HEX link
    hex_link = cells[1].find("a")

    if not hex_link:
        continue

    hex_code = hex_link.get_text(strip=True)

    # Make sure it is actually a HEX colour
    if not hex_code.startswith("#"):
        continue

    colors[hex_code.upper()] = name

# Save JSON
with open("colors.json", "w", encoding="utf-8") as f:
    json.dump(colors, f, indent=2, ensure_ascii=False)

print(f"Saved {len(colors)} colours to colors.json")