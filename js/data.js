// ─── Features & commands. Add or edit items here; the site updates itself. ───
window.FEATURES = [
  { icon: "🏆", title: "Chat levels", home: true, text: "Members earn XP for messages (1 minute cooldown). Level-ups are announced in your chosen channel." },
  { icon: "🎙️", title: "Voice levels", home: true, text: "XP every minute spent in voice, with its own level-up announcements." },
  { icon: "⏱️", title: "Voice session summary", home: true, text: "After leaving a call, a recap shows time spent, who was there and XP earned." },
  { icon: "⚔️", title: "FPS team mode", home: true, big: true, text: "Split one voice channel into two isolated squads, like in-game team audio." },
  { icon: "🎛️", title: "Team panel", text: "Post a button panel so players pick Team 1, Team 2 or All themselves." },
  { icon: "🔇", title: "Soundboard control", home: true, text: "Block Soundboard and external sounds for one member, in chosen or all voice channels." },
  { icon: "📊", title: "Stats dashboard", text: "Interactive panel with buttons for rank, leaderboard and team status." },
  { icon: "👋", title: "Welcome messages", text: "Greets every new member in the channel you pick." },
  { icon: "💎", title: "Boost thank-you", text: "Thanks server boosters and can grant a boost reward role." },
  { icon: "🔥", title: "Rotating status", text: "The bot’s status changes every 40 seconds: Ready to Battle, Rank Up Now, Drop Zone Active." },
  { icon: "⚙️", title: "Easy setup", text: "Change any announcement channel with /setchannel. No restart needed." },
  { icon: "⌨️", title: "Slash + prefix", text: "Use / commands or the classic !raider prefix (soundboard is slash only)." },
];

window.COMMANDS = [
  { group: "Levels & stats", items: [
    { cmd: "/rank [user]", desc: "View your rank and XP, or someone else’s." },
    { cmd: "/leaderboard", desc: "Top 10 members on the server." },
    { cmd: "/voicestats [user]", desc: "Voice session history and activity." },
    { cmd: "/dashboard", desc: "Open the interactive stats dashboard." },
    { cmd: "/help", desc: "Show the full command list." },
  ]},
  { group: "FPS team mode", admin: true, items: [
    { cmd: "/team setup <channel>", desc: "Choose the voice channel to split." },
    { cmd: "/team assign <user> <1|2>", desc: "Put a player in Team 1 or Team 2." },
    { cmd: "/team panel <on|off>", desc: "Post or remove the self-select button panel." },
    { cmd: "/team on", desc: "Activate isolation. Teams can only hear teammates." },
    { cmd: "/team off", desc: "Merge everyone back and delete temp channels." },
    { cmd: "/team status", desc: "View current team assignments." },
  ]},
  { group: "Soundboard control", admin: true, items: [
    { cmd: "/soundboard-block <member> [channel1..5]", desc: "Block Soundboard and external sounds. All voice channels if none picked." },
    { cmd: "/soundboard-unblock <member> [channel1..5]", desc: "Restore access." },
    { cmd: "/soundboard-status <member>", desc: "See where a member is restricted and who set it." },
  ]},
  { group: "Configuration", admin: true, items: [
    { cmd: "/setchannel <type> <channel>", desc: "Set the channel for welcome, boost, levelup, voice or dashboard messages." },
  ]},
];

// ─── Owner & admins shown in the "Owner & admins" section ───
// ADD PEOPLE HERE: copy one line, change the values. Only `name` and `role` are required.
//   role   → "Owner" or "Admin" (any text works)
//   avatar → optional picture URL (a Discord avatar link works). Leave out for an initial letter.
//   bio    → optional short line
//   link   → optional (e.g. their Discord or GitHub profile)
// If this list is EMPTY, the site shows the owner + admins found automatically by the bot instead
// (needs STATUS_GUILD_ID on the bot). The section hides itself if there is nothing to show.
window.TEAM = [
{ name: "Rumaboi", role: "Owner", avatar: "R", bio: "Founder", link: "841500694720020480" },
{ name: "KTG11", role: "Admin", avatar: "K", bio: "Moderator", link: "729961700551557212" },
{ name: "NoisyBoy", role: "Admin", avatar: "N", bio: "Moderator", link: "801981754634141706" },
{ name: "Bluepineapple", role: "Admin", avatar: "B", bio: "Moderator", link: "" },
];
