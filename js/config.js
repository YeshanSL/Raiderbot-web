// ─── EDIT THIS FILE to customise the whole site ───
window.RAIDER = {
  name: "Dark Raider",
  tagline: "Levels, voice tracking and FPS team audio for your Discord server.",
  clientId: "1553001957185167361", // Discord Developer Portal → Application ID
  supportUrl: "https://discord.gg/YOUR_INVITE",
  githubUrl: "https://github.com/YeshanSL/Raider-bot",

  // Passkey for the site. Create it with set-passkey.html and paste the line it gives you here.
  passkeyHash: "f7492ae2a6e1bbc86b46bfce20a83c76:1ba98a0b661957cd20d51c445fe22a972fdd5193b762698f8040db33b023035f",

  // Your bot's public URL (the panel-server.js API). No trailing slash.
  apiBase: "https://raider-bot-q15e.onrender.com/",

  // Bot status indicator
  //  "api"    → your bot serves /status (see bot-status-server.js)   ← recommended
  //  "widget" → uses Discord server widget (enable it in Server Settings → Widget)
  //  "demo"   → fake online data, for previewing the design
     status: {
     mode: "api",
     widgetGuildId: "980089449687965726",
     refreshSeconds: 30,
   },
};
window.RAIDER.status.apiUrl = window.RAIDER.apiBase + "/status";
window.RAIDER.inviteUrl =
  "https://discord.com/api/oauth2/authorize?client_id=" + window.RAIDER.clientId +
  "&permissions=8&scope=bot%20applications.commands";
