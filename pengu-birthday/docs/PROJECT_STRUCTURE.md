# Pengu Birthday Project Structure

This project is a static multi-page website.

## Core Pages
- `index.html`: Main landing page with splash, music toggle, quote-scroll experience, and bottom action buttons.
- `surprise.html`: Proposal/birthday interaction page with `Yes` video flow and runaway `No` button.
- `game.html`: Cat platformer mini-game page.
- `memes.html`: Meme navigation page.
- `cat-wall.html`: Cat GIF wall page.
- `videos.html`: Placeholder for future video content.
- `index_old.html`: Older snapshot kept as backup/reference.

## Styling
- `index.css`: Main page animations, quote transitions, responsive/mobile performance tuning.
- `style.css`: Styles used by legacy side pages (`memes.html`, `cat-wall.html`).

## Scripts and Automation
- `sync-to-github.ps1`: Sync script that mirrors this folder into `bangari-birthday/pengu-birthday` on GitHub (handles add/edit/delete).
- `script.js`: Legacy/unused local script (intentionally not used in current main flow).

## Assets
- `assets/`: Game assets and video placeholder location (`proposal.mp4` can be added here).
- `stickers/`: Quote images/sticker images.
- `fonts/`: Local custom fonts.
- `blue.mp3`: Background audio for main page.

## Recommended Update Flow
1. Make changes locally.
2. Validate in desktop and phone browser.
3. Run:
   - `powershell -ExecutionPolicy Bypass -File .\sync-to-github.ps1 -CommitMessage "your update message"`
