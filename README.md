# 🎬 SmartRen

A smart Electron application for automatically renaming media files for modern media servers. Similar to FileBot but much simpler and more user-friendly.

## ✨ Features

- **📁 Folder Selection** - Select a folder containing media files
- **📺 TV Series Support** - Automatic series detection via TMDB API
- **✏️ Manual Entry** - Manual series naming without API
- **🔑 User API Keys** - Users provide their own TMDB API keys
- **📺 Season Selection** - Choose season number for both TV series and manual entry
- **🎬 Episode Names** - Automatic episode titles from TMDB API
- **📝 Plex Format** - Generates Plex-compatible file names
- **🔄 Smart Sorting** - Natural sorting with user-selectable options (name, date, size)
- **⚙️ Settings** - Secure API key management

## 🚀 Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd smartren
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the application:**
   ```bash
   npx electron .
   ```

## 🔑 API Key Setup

### Getting a Free TMDB API Key

1. Go to [TMDB API Settings](https://www.themoviedb.org/settings/api)
2. Create a free account (if you don't have one)
3. Click "Request an API Key"
4. Select "Developer" (free option)
5. Fill in the application details:
   - **Application Name:** SmartRen
   - **Application Summary:** Media file renaming tool
6. Copy your API key

### Setting Up Your API Key

1. Open SmartRen
2. Click **⚙️ Settings** button
3. Paste your API key in the "API Key" field
4. Click **💾 Save API Key**
5. Your key is now securely stored locally

## 📖 How to Use

### Method 1: TV Series (with TMDB API)

1. **📁 Select Folder** - Choose folder containing your media files
2. **📺 TV Series** - Select TV Series option
3. **🔍 Search** - Enter series name (e.g., "Supernatural")
4. **Select Series** - Choose from search results
5. **📺 Select Season** - Enter season number (e.g., 1, 2, 3...)
6. **✅ Confirm Season** - Wait for episode data to load
7. **👁️ Preview** - Review the renaming preview
8. **✏️ Rename Files** - Apply the changes

**Result:** `Supernatural - S01E01 - Pilot.ts`

### Method 2: Manual Entry (no API required)

1. **📁 Select Folder** - Choose folder containing your media files
2. **✏️ Manual Entry** - Select Manual Entry option
3. **Enter Series Name** - Type your series name (e.g., "My Custom Series")
4. **Enter Season Number** - Type season number (e.g., 2)
5. **✅ Confirm** - Confirm your entry
6. **👁️ Preview** - Review the renaming preview
7. **✏️ Rename Files** - Apply the changes

**Result:** `My Custom Series - S02E01.ts`

## 🎯 Supported File Formats

- **Video:** `.mp4`, `.mkv`, `.avi`, `.mov`, `.wmv`, `.flv`, `.webm`, `.m4v`, `.ts`, `.m2ts`, `.mts`, `.vob`, `.iso`
- **Audio:** `.mp3`, `.flac`, `.wav`, `.aac`, `.ogg`

## 🔄 Sorting Options

In the preview section, you can sort files by:
- **📝 Name** - Alphabetical order (natural sorting for numbers)
- **📅 Date** - By modification date
- **💾 Size** - By file size

**Note:** Original files are sorted, but new names are always generated sequentially (E01, E02, E03...)

## 💾 Data Storage

### Where Your Data is Stored

- **API Keys:** Stored in browser's `localStorage` (local to your computer)
- **No Cloud Storage:** All data stays on your device
- **Secure:** API keys are never shared or transmitted

### Data Location

- **macOS:** `~/Library/Application Support/SmartRen/`
- **Windows:** `%APPDATA%/SmartRen/`
- **Linux:** `~/.config/SmartRen/`

## 🛠️ Technical Details

### Built With

- **Electron** - Desktop app framework
- **Node.js** - Backend runtime
- **TMDB API** - Movie/TV series database
- **HTML/CSS/JavaScript** - Frontend

### File Structure

```
smartren/
├── main.js          # Main Electron process
├── renderer.js      # Renderer process (UI logic)
├── index.html       # User interface
├── styles.css       # Styling
├── tmdb.js          # TMDB API integration
├── config.js        # Configuration (no API keys)
└── package.json     # Dependencies
```

## 🔒 Privacy & Security

- **Local Storage Only** - All data stays on your computer
- **No Tracking** - No analytics or user tracking
- **API Key Security** - Keys stored locally, never transmitted
- **Open Source** - Full source code available

## 🐛 Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify your API key is correct
   - Check if you have internet connection
   - Ensure TMDB API is accessible

2. **Files Not Detected**
   - Check if files are in supported formats
   - Ensure folder contains media files
   - Try refreshing the folder selection

3. **Episode Names Not Loading**
   - Check your internet connection
   - Verify API key is valid
   - Try with a different series

### Getting Help

- Check the console for error messages (F12 → Console)
- Ensure all dependencies are installed
- Verify Node.js and Electron versions

## 📝 License

This project is open source. Feel free to modify and distribute.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

---

**Made with ❤️ for media enthusiasts**