# Dark Raider website
Plain HTML / CSS / JS. No build step. Upload the files to the repo root and Vercel serves them.

- index.html, docs.html  → the pages
- js/config.js           → bot name, links, passkey hash, bot address, status mode
- js/data.js             → features, commands, and the manual Owner & admins list (TEAM)
- js/gate.js             → passkey lock screen
- js/panel.js            → control panel (channels, team mode, soundboard)
- css/style.css          → colours and fonts (top of the file)
- set-passkey.html       → open in a browser to create a new passkey hash for config.js

The control panel needs the bot's PANEL_PASSKEY to be the same passkey as this site's.
