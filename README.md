# Dark Raider website
Plain HTML / CSS / JS. No build step. Upload the files to the repo root and Vercel serves them.

Pages
- index.html      → home: live bot summary (status, servers, members, online), highlights, team mode steps
- commands.html   → searchable command list with group filters and copy buttons
- control.html    → control center: bot status, owner & admins, server snapshot, channel / team mode / soundboard controls
- docs.html       → documentation
- set-passkey.html → open in a browser to create a new passkey hash for config.js

Files
- js/config.js    → bot name, links, passkey hash, bot address, status mode (unchanged)
- js/data.js      → features, commands, and the manual Owner & admins list (TEAM). Features marked `home: true` show on the home page
- js/layout.js    → top bar, footer, lock screen and toast shared by every page (edit the menu here)
- js/gate.js      → passkey lock screen logic
- js/main.js      → status, commands page, staff list, docs helpers
- js/panel.js     → control panel logic (talks to the bot's /panel API)
- css/style.css   → colours and fonts (top of the file)

The control panel needs the bot's PANEL_PASSKEY to be the same passkey as this site's.

Private-site changes
- assets/ holds the logo, header mark and favicons (also favicon.ico in the root). Replace the PNGs to change the branding.
- Lock screen: boot loader → passkey → unlock animation. The Lock button (top bar and footer) locks the site and clears the panel login.
- robots.txt and a noindex meta tag keep search engines out.
