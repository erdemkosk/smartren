const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const TMDBAPI = require('./tmdb');

let mainWindow;
const tmdb = new TMDBAPI();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets/icon.icns'),
    title: 'SmartRen - Media File Renaming Tool',
    frame: true,
    titleBarStyle: 'default',
    closable: true,
    minimizable: true,
    maximizable: true
  });

  mainWindow.loadFile('index.html');

  // Handle window close event
  mainWindow.on('close', (event) => {
    // Allow the window to close normally
    console.log('Window closing...');
  });

  // Geliştirme modunda DevTools'u aç
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

// Handle window close events
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle before-quit event
app.on('before-quit', (event) => {
  // Allow the app to quit normally
});

// Handle window close - moved inside createWindow function

// IPC handlers
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Medya klasörünü seçin'
  });
  
  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('scan-folder', async (event, folderPath) => {
  try {
    const files = await scanMediaFiles(folderPath);
    return files;
  } catch (error) {
    console.error('Folder scanning error:', error);
    return [];
  }
});

ipcMain.handle('search-media', async (event, query, type, userApiKey) => {
  try {
    // Use user's API key if provided, otherwise use default
    if (userApiKey && userApiKey !== 'YOUR_TMDB_API_KEY_HERE') {
      tmdb.apiKey = userApiKey;
    }
    
    if (type === 'movie') {
      return await tmdb.searchMovie(query);
    } else if (type === 'tv') {
      return await tmdb.searchTV(query);
    }
    return [];
  } catch (error) {
    console.error('Media search error:', error);
    return [];
  }
});

ipcMain.handle('get-media-details', async (event, id, type, userApiKey) => {
  try {
    // Use user's API key if provided, otherwise use default
    if (userApiKey && userApiKey !== 'YOUR_TMDB_API_KEY_HERE') {
      tmdb.apiKey = userApiKey;
    }
    
    if (type === 'movie') {
      return await tmdb.getMovieDetails(id);
    } else if (type === 'tv') {
      return await tmdb.getTVDetails(id);
    }
    return null;
  } catch (error) {
    console.error('Media details error:', error);
    return null;
  }
});

ipcMain.handle('get-tv-episodes', async (event, tvId, seasonNumber, userApiKey) => {
  try {
    // Use user's API key if provided, otherwise use default
    if (userApiKey && userApiKey !== 'YOUR_TMDB_API_KEY_HERE') {
      tmdb.apiKey = userApiKey;
    }
    
    return await tmdb.getTVEpisodes(tvId, seasonNumber);
  } catch (error) {
    console.error('Episode information error:', error);
    return [];
  }
});

ipcMain.handle('rename-files', async (event, renameData) => {
  try {
    const results = [];
    for (const item of renameData) {
      const result = await renameFile(item.oldPath, item.newPath);
      results.push(result);
    }
    return results;
  } catch (error) {
    console.error('Yeniden adlandırma hatası:', error);
    return [];
  }
});

// Medya dosyalarını tarama fonksiyonu
async function scanMediaFiles(folderPath) {
  const mediaExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.ts', '.m2ts', '.mts', '.vob', '.iso'];
  const files = [];
  
  async function scanDirectory(dir) {
    const items = await fs.readdir(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        await scanDirectory(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        if (mediaExtensions.includes(ext)) {
          files.push({
            name: item,
            path: fullPath,
            extension: ext,
            size: stat.size,
            modified: stat.mtime
          });
        }
      }
    }
  }
  
  await scanDirectory(folderPath);
  return files;
}

// Dosya yeniden adlandırma fonksiyonu
async function renameFile(oldPath, newPath) {
  try {
    await fs.move(oldPath, newPath);
    return { success: true, oldPath, newPath };
  } catch (error) {
    return { success: false, oldPath, newPath, error: error.message };
  }
}
