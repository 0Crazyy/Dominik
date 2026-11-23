// Posts of the Updates page, newest first. Written by hand, and only when the site owner asks for a post.
// Fields: id (unique, also the link anchor), date (YYYY-MM-DD), type (the badge), title, summary (always visible)
// and body (Markdown). The body supports: ## section titles, ### subtitles, - lists (indent two spaces for a sub-item),
// **bold**, *italic*, `code`, [text](https://link) and --- . Posts and sections all start collapsed,
// so make each title say what changed.
const UPDATES = [
  {
    id: "accounts-and-more",
    date: "2026-11-23",
    type: "Update",
    title: "Accounts with Discord login, teams published straight to the site, and everything else since the Welcome post",
    summary: "Log in with Discord to publish, like and report teams, manage or delete your data, plus the game's text colors, Event memories, new weapons, C.U.B. icons by element, better search and a new Planner export.",
    body: `## Accounts: log in with Discord
- You can now log in with your Discord account. The login is optional: browsing, the Planner and the Meta Timeline work the same without it.
- The site only stores what it needs to run the account, and the session lives in a protected cookie.
- The **Account** page shows your data and lets you **download** everything the site has about you or **delete** your account for good.
- A **Privacy** page explains what is stored and why (LGPD and GDPR).

## Teams: publish, like and report
- Teams from the Team Builder are now published straight to the site by logged-in accounts. There is no review queue anymore: the author's name shows on the team, and there are limits per account and per IP to keep spam out.
- Teams on the site are the community's teams. The old official builds were removed, and their old addresses now take you to the matching page.
- Teams can be **liked**, and you can **report** one that is wrong or abusive.
- Authors can delete their own team whenever they want.
- Short share links (\`/editor?s=...\`) keep working.
- An **admin panel** handles reports, teams, accounts and a log of every moderation action. Only admins can open it.

## Skills and C.U.B.s now use the game's own text colors
- Skill and C.U.B. descriptions show the same highlights the game uses, so you can spot the key effects at a glance. The words are unchanged, only the colors were copied.
- Memories, weapon effects and Harmony stay plain, and resonances only color their status.
- Fixed doubled "Leader - " prefixes and a few typos in the skill texts.

## Memories, weapons and Harmony
- Event memories were added, and memory pages now show the full art.
- New 6-star weapons: **Hestia** (Liv: Empyrea) and **Darkness** (Kamui: Tenebrion).
- Weapon Harmony has a bar and stars, so the level is easier to read.
- Fixed Ayla: Brilliance's release order (Fallen Star) and marked Camu: Crocotta as Grand Blue.
- Fixed the Skill 1 element on Boreas, Cavaliere, Zafkiel, Scaled Rampart and Yuan Ye.

## C.U.B.s: icons and skills follow the carrier's element
- The Active skill icon, name and text change with the element of the character carrying the C.U.B., on its page and on the cards.
- C.U.B.s that had no passive icon now have one, and the ATK skills share a single icon.

## Finding things faster
- Tables have a search box, and search now also looks inside effect texts.
- Constructs filters sit behind a button, and Assets controls are more compact on phones.
- Build rows show the teammates, team pages show their characters, and construct pages have a shortcut to their builds.
- The Team Builder help can be collapsed, and the build list has a maximum width on big screens.
- New Special Effects icon, and the site title is now "Builds & Plans".

## Planner: a better export and more accurate passes
- Tactical Assessment passes in the running patch now add their RC cost.
- The starting balance boxes fit six digits and step by 250.
- The exported image has one panel per patch, drawn as start + earnings - expenses, with the passes and the final balance compared to the patch before.
- Patch Start, Patch Earnings and Expenses share one evenly spaced box.
- The preview has an **Export up to** list to pick the last patch. It redraws the image and remembers your choice.
- The patch forecast was updated, with the next patches and their expected income.

## Other changes
- The Meta Timeline data was refreshed with the latest frames.
- New home page quotes, a Weapons icon, and the fonts are now served from the site itself.
- Awaken art for Helentine, Kamui and Vera was renamed with their full names.`
  },
  {
    id: "welcome",
    date: "2026-11-15",
    type: "Welcome",
    title: "Welcome to Dominik: what the site is and everything that is already here",
    summary: "The idea behind the site, who made it and how, how it started, and a look at everything added since.",
    body: `## Made by hand, with Claude's help
Dominik was built with Claude, an AI, as a coding assistant. Every design (the layout, the look, the rank badges, the art direction) was made by hand, by me and Sidewayz. Claude brought in and organised data that already existed, like builds, skills and the patch history, and wrote code around my and Sidewayz's designs.

I started playing at the Global launch and I have played Punishing: Gray Raven every day since. Despite its flaws, I love this game, and I always enjoy making content that is useful to the community, like the Tickets Income spreadsheet that the Planner is based on.

## Inspiration and the name
I took a lot of inspiration from the Huaxu site by blacknovatech, and the name follows a similar idea: in the story, Huaxu and the digital Dominik are both artificial minds. Dominik was a legendary scientist and leader of the Golden Age, and his digital copy reaches the Commandant through an invitation. I liked the name as a nod to someone who left something useful for others.

## Why Dominik exists
Information about Punishing: Gray Raven is spread across guides, videos and spreadsheets. Dominik puts the common answers in one place:
- Which team should I run for this energy type or effect?
- Which memories, weapon and resonances does each character need?
- How many Black Cards will I have by a future patch, and can I afford the next banner?
- How long do characters usually stay in the meta, and who may be replaced next?

It is a fan-made site: no account, nothing to install, and it works on desktop and phones.

## How it started
The first version, in January 2026, was a couple of plain pages with a team composition. Weapon and Harmony were added to it on January 10. On November 5 that old site was replaced by the Dominik build site you are on now, still plain HTML, CSS and JavaScript with nothing to install.

## Teams and Constructs: builds, rotations and character pages
- Teams are grouped by energy type, effect and special effect, and every team has its own address you can share.
- Each character card shows memories, weapon harmony and resonances, with the build notes split into bullet points.
- **Export image** saves a build as a picture.
- Teams got rotations and captain tooltips, and the captain is shown as LEADER.
- Constructs lists every character with a build, with filters for element, class, rank and effect, and each one has a page with its skills.
- Rank badges: every rank level has its own badge, redrawn for the SS tiers, and every card shows its rank.

## Assets: memories, weapons, resonances and C.U.B.s
- Memories, Weapons, Weapon Resonance and C.U.B.s are sortable tables.
- Memory cards show their stats, and memories show the patch they were released in.

## Planner: Black Cards and pull odds
The Planner started as the BC Calculator and was renamed in November.
- Enter your starting balance and see your Black Cards across upcoming patches.
- Pick passes (including the other monthly passes) and see their cost, with estimated real-money prices.
- The Events List lets you mark events you have already done.
- The Pull chance tab shows your odds for a banner and a number of pulls, including how often pity triggers.
- It uses the same math as my Tickets Income spreadsheet, which I made with Sidewayz.

## Meta Timeline: how long each frame stays in the meta
- Shows how long each S-Rank frame held its place before a newer one replaced it.
- Rankings of who lasted longest and shortest, and the average time until replacement for each class.
- A replacement watch compares each current frame with the average of its class. It is a guide, not a release date.
- Dates follow the Chinese server, which gets each frame first.

## Team Builder and community teams
- Put a team together from the site's characters, memories and resonances, and share it as a link or an image.
- You can also send your team to be reviewed. Approved teams show up on the site next to the official builds.
- The team box has an icon page picker, rotation chips and tags, and sharing shows a short message when it is done.
- The "Others" menus hold the rest of the options.

## Around the site
- Search from the menu finds constructs, teams, memories, weapons, resonances and C.U.B.s, with the closest match first.
- The side menu has icons and can be kept open. On desktop it is a slim rail of icons.
- Pages open with clean addresses and a link preview for each page.
- Images load as light copies, so pages open fast on a phone.

## Should the site have a login? I want your feedback
I am not sure whether Dominik should have accounts. Today there is no login at all, and that keeps the site simple and fast to use. A login could make things like saving your own teams or your Planner settings across devices possible, but it would also mean an account to create and more to look after.

I would like to know what you think: would you use a login, and what would you want it for? Tell me on the [Credits page](/credits).

## A Portuguese version is planned for when the site is more complete
For now Dominik is only in English. A Portuguese (Brazil) version is planned, and I will add it once the site has more of what it needs, so it is translated once instead of redone every time something new appears.
- Descriptions, notes and the rest of the text will be translated. Names that come from the game, such as skills, effects and mechanics, will stay as they are in the game.
- Browsers set to Portuguese will open the site in Portuguese by themselves.
- The **EN | PT** button at the bottom of the side menu will switch the language by hand. It is already there, but turned off until the translation is ready.

## What comes next
This page will list the changes made to the site as they happen. Found a wrong build, or have another suggestion? Use the [Credits page](/credits).`
  }
];
