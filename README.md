# Blood on the Clocktower - Grimoire Helper

A digital grimoire helper for Blood on the Clocktower storytellers. Run your entire game from one site!

## Features

- **📜 Script Loader**: Load official scripts (Trouble Brewing, Bad Moon Rising, Sects & Violets) or import custom JSON scripts
- **🧮 Setup Calculator**: Calculate character distribution based on player count with setup-modifier handling
- **🎭 Character Bag**: Draw system for random character assignment - players can come up and draw their roles
- **📖 Grimoire**: Full storyteller view with circular player arrangement, character assignment, and reminder tokens

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Deployment

This project is configured for easy deployment to:
- **Vercel**: Just connect your GitHub repo
- **Netlify**: Connect repo or drag-drop the `dist` folder

## Custom Script JSON Format

The app supports the standard BOTC script JSON format:

```json
[
  { "id": "_meta", "name": "My Script", "author": "Your Name" },
  { "id": "washerwoman" },
  { "id": "imp" },
  {
    "id": "custom_character",
    "name": "Custom Character",
    "team": "townsfolk",
    "ability": "Your custom ability text"
  }
]
```

## Tech Stack

- React 19
- Vite
- CSS Variables for theming
- LocalStorage for game state persistence

## License

ISC
