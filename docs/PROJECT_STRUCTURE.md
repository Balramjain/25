# Pengu Birthday Project Structure

This project is a static multi-page website.

## Core Pages (`html/`)
- `html/index.html`: Main landing page with splash, music toggle, quote-scroll experience, and bottom action buttons.
- `html/surprise.html`: Proposal/birthday interaction page with `Yes` video flow and runaway `No` button.
- `html/game.html`: Cat platformer mini-game page.
- `html/memes.html`: Meme navigation page.
- `html/cat-wall.html`: Cat GIF wall page.
- `html/videos.html`: Placeholder for future video content.

## Styling (`css/`)
- `css/index.css`: Main page animations, quote transitions, responsive/mobile performance tuning.
- `css/style.css`: Styles used by legacy side pages (`memes.html`, `cat-wall.html`).

## Scripts And Automation
- `sync-to-github.ps1`: Sync script that mirrors this folder into `bangari-birthday/pengu-birthday` on GitHub (handles add/edit/delete).

## Assets
- `audio/`: Background audio files.
- `video/`: Video files (`proposal.mp4` placeholder location).
- `stickers/`: Quote images/sticker images.
- `fonts/`: Local custom fonts.

## Cleanup Applied
- Removed unused legacy files:
  - `script.js`
  - `index_old.html`
- Removed unused folders:
  - `assets/`
  - `text/`

## Recommended Update Flow
1. Make changes locally.
2. Validate in desktop and phone browser.
3. Run:
   - `powershell -ExecutionPolicy Bypass -File .\sync-to-github.ps1 -CommitMessage "your update message"`
