import os
from bs4 import BeautifulSoup

# Path to your front-end repo
repo_path = r"C:\Users\admin\Desktop\github front repo\A1UtilityHub-front"

# Iterate through all HTML files
for root, dirs, files in os.walk(repo_path):
    for file in files:
        if file.endswith(".html"):
            file_path = os.path.join(root, file)
            
            with open(file_path, "r", encoding="utf-8") as f:
                soup = BeautifulSoup(f, "html.parser")
            
            # --- Fix mobile menu button ---
            menu_btn = soup.find(id="mobile-menu-button")
            if menu_btn:
                menu_btn["aria-label"] = "Open navigation menu"
                menu_btn["aria-expanded"] = "false"
            
            # --- Fix copy buttons ---
            for btn in soup.select(".copy-button"):
                btn["aria-label"] = "Copy result to clipboard"
            
            # --- Fix heading order ---
            # Simple approach: if multiple h1, convert subsequent to h2
            h_tags = soup.find_all(["h1", "h2", "h3", "h4"])
            first_h1 = True
            for h in h_tags:
                if h.name == "h1":
                    if first_h1:
                        first_h1 = False
                    else:
                        h.name = "h2"
            
            # --- Add alt text for images ---
            for img in soup.find_all("img"):
                if not img.get("alt"):
                    img["alt"] = "Descriptive text here"  # You can customize or add logic
            
            # Save changes
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(str(soup))

print("Accessibility fixes applied to all HTML files!")
