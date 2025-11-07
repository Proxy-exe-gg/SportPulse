# SportsPulse — Multi-Sport Data Analytics (Prototype)

This is a browser-only prototype created for a hackathon demo. It simulates live sports data for Football, Cricket, and Basketball using an offline dataset (generated in `js/data.js`). The UI uses modern glassmorphic styling and Chart.js for visualizations.

Files added/changed
- `hackathon project.html` — main dashboard HTML (updated)
- `css/style.css` — glassmorphic UI styles
- `js/data.js` — offline synthetic dataset (~120 records per sport) and simple team stats
- `js/app.js` — app logic, charts, refresh simulation, and simple prediction

How to run

Quick (no server):
1. Open `hackathon project.html` directly in any modern browser (Chrome/Edge/Firefox). Double-click the file or use your editor's "Open in Browser".
2. Use the left sidebar to switch sports. Click "Refresh" to simulate live updates.
3. Charts will update automatically every 45s (simulation).

Search, filter and export
- Use the search box (top controls) to find teams, leagues or matches.
- Use the Status or League filters to narrow results.
- Use Sort to reorder results by date or combined score.
- Click "Export CSV" or "Export JSON" to download the currently visible (filtered) dataset.

Deep linking
- Team names are deep-linkable. Clicking a team copies a URL hash like `#team=Team%20Name` into the address bar. You can copy/share that link with judges — opening it will open the team's detail modal automatically.

Upload & Favorites
- Use the "Upload Data" button to import a CSV or JSON file containing match records. CSV should include headers such as `id,sport,home,away,date,league,score,status` (the parser is tolerant but follow that shape for best results).
- Uploaded data merges into the current dataset and updates the UI.
- Click the star (★) on any match to bookmark it to Favorites. Open the Favorites panel to quickly open or remove saved bookmarks. Favorites are stored in the browser's localStorage.

Run with a simple local server (recommended for accurate CDN and fetch behavior):
PowerShell:
```powershell
cd "C:\Users\Abhishek\OneDrive\Desktop\hackathon"
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

Offline / air-gapped demo (optional):
- Download Chart.js (minified) and place it at `vendor/chartjs/chart.min.js`. The page already prefers this local file and will fallback to CDN if missing.

Quick deploy notes
- Replit: create a new Repl (static HTML), upload the files and set the run command to `python -m http.server 8000` or use Replit's static hosting.
- Netlify / Vercel: drag-and-drop the project folder (or connect the repo) — these services serve static sites directly.

How the synthetic data works
- `js/data.js` generates ~120 matches per sport with randomized scores, statuses, and leagues.
- Team win ratios are calculated from the dataset and used by the simplistic prediction engine in `js/app.js`.

Next steps / Integration notes
- To use real APIs, replace or augment `js/data.js` and `js/app.js` fetch logic with real endpoints.
- Add more in-depth prediction models (server-side ML or client-side lightweight models) if required.

Quality gates
- The prototype is self-contained and runs offline; Chart.js is loaded via CDN.

Contact
- This is a hackathon prototype. For improvements, add tests, CI, and server-side ingestion for real-time data.
