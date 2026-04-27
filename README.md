# CyberShield

CyberShield ek interactive **Cyber Security Awareness Simulator** hai jo users ko practical missions ke through phishing, password security, fake website detection, social engineering, aur network safety sikhata hai.

## Features

- Multi-level gamified training flow
- Difficulty modes: `Beginner`, `Intermediate`, `Expert`
- Real-time timer + scoring + XP progress
- Phishing email detection simulator
- Password strength analyzer with crack-time estimate
- Fake website vulnerability spotting challenge
- Social engineering scenario-based quiz
- Bonus network safety identification level
- Final performance report with skill chart (Chart.js)
- Downloadable completion certificate (PNG)
- Local leaderboard (`localStorage` based)
- Dark/Light theme toggle
- Fully responsive UI (desktop + mobile)

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6)
- Chart.js (CDN)
- Google Fonts (CDN)

## Project Structure

- `index.html` -> App layout and all screens
- `styles.css` -> Styling, animations, responsive design
- `script.js` -> Game logic, scoring, levels, leaderboard, report, certificate

## How to Run

1. Project folder open karein.
2. `index.html` ko browser mein open karein.
3. Training start karne ke liye **START TRAINING** button press karein.

Optional (recommended for best behavior):

- VS Code Live Server use karein.

## Gameplay Flow

1. Difficulty select karein.
2. Levels क्रम se complete karein (locked levels unlock hote jayenge).
3. Har level mein points earn karein aur mistakes se penalties mil sakti hain.
4. Sab levels complete hone par final report aur rank milega.
5. Certificate download karein aur leaderboard check karein.

## Scoring & Progress

- Difficulty ke hisab se points multiplier aur penalty multiplier change hota hai.
- Har level ka timer alag hota hai.
- Overall score se rank decide hoti hai.
- Skill-wise graph final report mein show hota hai.

## Data & Storage

- Leaderboard browser `localStorage` mein save hota hai.
- `Clear Board` se leaderboard reset kiya ja sakta hai.

## Notes

- Ye project educational purpose ke liye banaya gaya hai.
- Internet connection first load ke time CDN fonts/chart ke liye helpful hai.

## Author

CyberShield Project
