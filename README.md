# Football Frenzy

## What the game is

Football Frenzy is a 2D platformer that runs in your browser. You play **Blitz**, a round football helmet with a face mask who runs and jumps across the field to reach the end zone. There are **3 levels**: Practice Field, Opening Game Day, and The Final Drive. The game is drawn on an HTML canvas with JavaScript, and a small Flask (Python) server supplies the level data and the high-score board.

## Required software

- **Python 3** (tested with Python 3.13 on macOS)
- **Git**, to clone the project
- A modern web browser

## Installing Python dependencies

First, download the project:

```bash
git clone https://github.com/Djdunhill09/football-frenzy.git
cd football-frenzy
```

From the project folder, create and activate a virtual environment, then install the requirements (just Flask):

```bash
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Starting the web application

With the virtual environment active:

```bash
python run.py
```

The server starts in debug mode on port 5001.

## What URL to open

- Local (Flask version, with high scores): <http://127.0.0.1:5001>
- Live (GitHub Pages version, no high scores): <https://djdunhill09.github.io/football-frenzy/>

## Keyboard controls

| Key | Action |
| --- | --- |
| Left Arrow / A | Move left |
| Right Arrow / D | Move right |
| Space / Up Arrow / W | Jump |
| P | Pause / resume |
| R | Restart from Level 1 (not available on the title screen) |
| Enter | Start the game from the title screen; go to the next level after a touchdown |

The game also pauses automatically when the browser window loses focus.

## How to play

- **Goal:** get Blitz from the left side of each level to the end zone on the right.
- **Downs:** you start with **3 downs** (lives). Touching a defender or tackling sled, or falling into a gap in the field, costs one down and sends Blitz back to the level's start. When downs reach 0, the game is over. Downs carry over between levels.
- **Footballs:** each football you collect is worth **100 points**. A football counts once, even if you are sent back to the start.
- **Touchdown:** reaching the end zone scores **500 points** and ends the level.
- **Yards gained:** the bar at the top right shows how far Blitz is from the end zone.
- **Maximum score:** 3 touchdowns (3 × 500 = 1,500) plus all 14 footballs (14 × 100 = 1,400) gives a perfect score of **2,900**.

When the game ends (game over or a win), you can enter your name to submit your score to the high-score board (Flask version only).

## How the levels work

- **Level 1: Practice Field** – Daytime. One continuous stretch of turf, four platforms to climb, and two tackling sleds to jump over. 4 footballs.
- **Level 2: Opening Game Day** – Night. The field has two gaps to jump across, with bleacher stepping stones above them, plus two stationary defenders. 5 footballs.
- **Level 3: The Final Drive** – Night and rain. Two gaps, mud puddles that halve Blitz's horizontal speed, two defenders that patrol back and forth, a moving platform, and a staircase of small platforms up to a raised end zone. 5 footballs.

Some footballs are on the main route; others are optional and take extra risk to reach.

## What Python does in the application

- **Flask routes** (`app/routes.py`):
  - `GET /` serves the game page (`templates/index.html`).
  - `GET /api/levels/<n>` returns level `n` as JSON, or a 404 if it doesn't exist.
  - `GET /api/scores` returns the high-score board.
  - `POST /api/scores` adds a score (JSON with `name` and `score`); returns 201, or 400 for invalid input.
- **Level data** lives in `app/levels.py`: platforms, gaps, hazards, footballs, goals, sky and weather for each level. It is the single source of truth for the levels.
- **High scores** are handled in `app/scores.py`. The top 10 scores are saved to `data/scores.json` (names up to 20 characters). That file is created on the first submitted score and is not tracked by Git.
- **`build_static.py`** generates the `docs/` folder for GitHub Pages (see below).

**Note:** high scores only work in the Flask version. The GitHub Pages version has no server, so the name form and score board are not available there.

## Rebuilding the GitHub Pages version

After changing levels (`app/levels.py`) or front-end code (`static/`), run:

```bash
python build_static.py
```

This writes a fresh `docs/` folder (static page, scripts, styles, and `levels.json`). **Never hand-edit files in `docs/`**: the script deletes and recreates the whole folder, so any manual changes are lost.

## AI tools used

- **Cursor** (Agent mode, Grok 4.7, free plan) was used for the project setup and the first features.
- After hitting Cursor's usage limit, I switched to **Claude Code** (Anthropic) to continue development.
- **Claude chat** was used for guidance along the way.
- All AI-generated changes were reviewed before being accepted.
