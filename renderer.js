const { ipcRenderer } = require('electron');
const path = require('path');

// DOM elements
const selectFolderBtn = document.getElementById('selectFolderBtn');
const selectedFolder = document.getElementById('selectedFolder');
const mediaSection = document.getElementById('mediaSection');
const mediaSearch = document.getElementById('mediaSearch');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const renameBtn = document.getElementById('renameBtn');
const previewSection = document.getElementById('previewSection');
const previewList = document.getElementById('previewList');
const resultsSection = document.getElementById('resultsSection');
const resultsList = document.getElementById('resultsList');
const loading = document.getElementById('loading');

// Settings elements
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiBtn = document.getElementById('saveApiBtn');
const clearApiBtn = document.getElementById('clearApiBtn');
const apiStatus = document.getElementById('apiStatus');

// Language elements
const languageSelect = document.getElementById('languageSelect');
const saveLanguageBtn = document.getElementById('saveLanguageBtn');
const languageStatus = document.getElementById('languageStatus');

// Manual entry elements
const searchContainer = document.getElementById('searchContainer');
const manualInputContainer = document.getElementById('manualInputContainer');
const manualSeriesName = document.getElementById('manualSeriesName');
const manualSeasonNumber = document.getElementById('manualSeasonNumber');
const confirmManualSeriesBtn = document.getElementById('confirmManualSeriesBtn');

// Season selection elements
const seasonSelection = document.getElementById('seasonSelection');
const seasonNumber = document.getElementById('seasonNumber');
const confirmSeasonBtn = document.getElementById('confirmSeasonBtn');

// Global variables
let currentFolder = null;
let mediaFiles = [];
let renameData = [];
let selectedMedia = null;
let searchResultsData = [];

// Event listeners
selectFolderBtn.addEventListener('click', selectFolder);
searchBtn.addEventListener('click', searchMedia);
mediaSearch.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchMedia();
    }
});

// Add event listeners for sort options
document.addEventListener('change', (e) => {
    if (e.target.name === 'sortType' && renameData.length > 0) {
        displayPreview(renameData);
    }
});

renameBtn.addEventListener('click', renameFiles);

// Settings event listeners
settingsBtn.addEventListener('click', openSettings);
closeSettingsBtn.addEventListener('click', closeSettings);
saveApiBtn.addEventListener('click', saveApiKey);
clearApiBtn.addEventListener('click', clearApiKey);

// Close modal when clicking outside
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        closeSettings();
    }
});

// Manual entry event listeners
confirmManualSeriesBtn.addEventListener('click', confirmManualSeries);

// Season selection event listeners
confirmSeasonBtn.addEventListener('click', confirmSeason);

// Media type change listener
document.addEventListener('change', (e) => {
    if (e.target.name === 'mediaType') {
        const mediaType = e.target.value;
        if (mediaType === 'manual') {
            searchContainer.style.display = 'none';
            manualInputContainer.style.display = 'flex';
            searchResults.style.display = 'none';
        } else {
            searchContainer.style.display = 'flex';
            manualInputContainer.style.display = 'none';
        }
    }
});

// Folder selection
async function selectFolder() {
    try {
        const folderPath = await ipcRenderer.invoke('select-folder');
        if (folderPath) {
            currentFolder = folderPath;
            selectedFolder.textContent = folderPath;
            mediaSection.style.display = 'block';
            previewSection.style.display = 'none';
            resultsSection.style.display = 'none';
            mediaFiles = [];
            renameData = [];
            selectedMedia = null;
            searchResultsData = [];
            searchResults.innerHTML = '';
            renameBtn.disabled = true;
            
            // Automatically scan files when folder is selected
            scanFiles();
        }
    } catch (error) {
        console.error('Folder selection error:', error);
        alert('Error occurred while selecting folder!');
    }
}

// Media search
async function searchMedia() {
    const query = mediaSearch.value.trim();
    if (!query) {
        alert('Please enter a search term!');
        return;
    }

    const mediaType = document.querySelector('input[name="mediaType"]:checked').value;
    
    showLoading(true);
    
    try {
        const userApiKey = getApiKey();
        searchResultsData = await ipcRenderer.invoke('search-media', query, mediaType, userApiKey);
        displaySearchResults(searchResultsData, mediaType);
        searchResults.style.display = 'block';
    } catch (error) {
        console.error('Media search error:', error);
        alert('Error occurred while searching!');
    } finally {
        showLoading(false);
    }
}

// Display search results
function displaySearchResults(results, mediaType) {
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">No results found</div>';
        return;
    }
    
    results.forEach((result, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.dataset.index = index;
        
        const posterUrl = result.poster_path ? 
            `https://image.tmdb.org/t/p/w500${result.poster_path}` : 
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNzUiIHZpZXdCb3g9IjAgMCA1MCA3NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9Ijc1IiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAyMEgzMFYzMEgyMFYyMFoiIGZpbGw9IiNDQ0MiLz4KPHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNzUiIHZpZXdCb3g9IjAgMCA1MCA3NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9Ijc1IiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAyMEgzMFYzMEgyMFYyMFoiIGZpbGw9IiNDQ0MiLz4KPC9zdmc+';
        
        const year = mediaType === 'movie' ? result.release_date?.substring(0, 4) : result.first_air_date?.substring(0, 4);
        const overview = result.overview ? result.overview.substring(0, 100) + '...' : 'No description';
        
        resultItem.innerHTML = `
            <img src="${posterUrl}" alt="Poster" class="result-poster" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNzUiIHZpZXdCb3g9IjAgMCA1MCA3NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9Ijc1IiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAyMEgzMFYzMEgyMFYyMFoiIGZpbGw9IiNDQ0MiLz4KPC9zdmc+'">
            <div class="result-info">
                <div class="result-title">${result.title || result.name}</div>
                <div class="result-details">${overview}</div>
                <div class="result-year">${year || 'Year unknown'}</div>
            </div>
        `;
        
        resultItem.addEventListener('click', () => selectMedia(result, mediaType, index));
        searchResults.appendChild(resultItem);
    });
}

// Select media
async function selectMedia(media, mediaType, index) {
    // Clear previous selection
    document.querySelectorAll('.search-result-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Mark new selection
    document.querySelector(`[data-index="${index}"]`).classList.add('selected');
    
    showLoading(true);
    
    try {
        // Fetch detailed information
        const userApiKey = getApiKey();
        const details = await ipcRenderer.invoke('get-media-details', media.id, mediaType, userApiKey);
        selectedMedia = { ...media, ...details, type: mediaType };
        
        // Files are already scanned, ready for preview
        
        // Show season selection for TV series
        if (mediaType === 'tv' && mediaFiles.length > 0) {
            seasonSelection.style.display = 'block';
            // Don't hide media section yet, wait for season selection
        } else {
            // Collapse media selection section for non-TV series
            mediaSection.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Media details error:', error);
        alert('Error occurred while loading media details!');
    } finally {
        showLoading(false);
    }
}

// Scan files
async function scanFiles() {
    if (!currentFolder) return;
    
    showLoading(true);
    
    try {
        mediaFiles = await ipcRenderer.invoke('scan-folder', currentFolder);
        
        if (mediaFiles.length === 0) {
            alert('No media files found in this folder!');
        }
    } catch (error) {
        console.error('File scanning error:', error);
        alert('Error occurred while scanning files!');
    } finally {
        showLoading(false);
    }
}


// Show preview
function showPreview() {
    if (mediaFiles.length === 0) return;
    
    renameData = generateRenameData(mediaFiles);
    displayPreview(renameData);
    previewSection.style.display = 'block';
    renameBtn.disabled = false;
}

// Generate rename data
function generateRenameData(files = mediaFiles) {
    if (!selectedMedia) {
        alert('Please select a media first!');
        return [];
    }

    if (!files || files.length === 0) {
        alert('No media files found!');
        return [];
    }

    // Sort files by name to ensure consistent episode numbering (natural sorting for numbers)
    const sortedFiles = [...files].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    return sortedFiles.map((file, index) => {
        const parsed = parseFileName(file.name);
        const newName = generateNewFileNameWithMetadata(selectedMedia, parsed, file.extension, index + 1);
        const newPath = path.join(path.dirname(file.path), newName);
        
        return {
            oldPath: file.path,
            newPath: newPath,
            oldName: file.name,
            newName: newName,
            parsed: parsed
        };
    });
}

// Parse file name
function parseFileName(fileName) {
    const nameWithoutExt = path.parse(fileName).name;
    
    // Parse common formats
    const patterns = [
        // Movie formats: Movie.Name.2023.1080p.BluRay.x264
        /^(.+?)\.(\d{4})\.(.+)$/,
        // TV series formats: Series.Name.S01E01.1080p.WEB-DL
        /^(.+?)\.S(\d{2})E(\d{2})\.(.+)$/,
        // Simple formats: Movie Name (2023)
        /^(.+?)\s*\((\d{4})\)$/,
        // Simple formats: Movie Name
        /^(.+)$/
    ];
    
    for (const pattern of patterns) {
        const match = nameWithoutExt.match(pattern);
        if (match) {
            if (pattern.source.includes('S\\d{2}E\\d{2}')) {
                // TV series format
                return {
                    type: 'series',
                    title: match[1].replace(/\./g, ' ').trim(),
                    season: parseInt(match[2]),
                    episode: parseInt(match[3]),
                    quality: match[4] || ''
                };
            } else if (pattern.source.includes('\\d{4}')) {
                // Movie format
                return {
                    type: 'movie',
                    title: match[1].replace(/\./g, ' ').trim(),
                    year: parseInt(match[2]),
                    quality: match[3] || ''
                };
            } else {
                // Basit format
                return {
                    type: 'unknown',
                    title: match[1].replace(/\./g, ' ').trim()
                };
            }
        }
    }
    
    return {
        type: 'unknown',
        title: nameWithoutExt.replace(/\./g, ' ').trim()
    };
}

// Generate new filename with metadata
function generateNewFileNameWithMetadata(metadata, parsed, extension, episodeNumber = 1) {
    let newName = '';
    
    if (metadata.type === 'movie') {
        // Movie format: Movie Name (2023)
        const year = metadata.release_date ? metadata.release_date.substring(0, 4) : '';
        newName = `${metadata.title}${year ? ` (${year})` : ''}`;
    } else if (metadata.type === 'tv') {
        // TV series format: Series Name - S01E01 - Episode Title
        const season = metadata.season || parsed.season || 1;
        const episode = parsed.episode || episodeNumber;
        newName = `${metadata.name} - S${season.toString().padStart(2, '0')}E${episode.toString().padStart(2, '0')}`;
        
        // Add episode title if available
        if (metadata.episodes && metadata.episodes.length > 0) {
            const episodeData = metadata.episodes.find(ep => ep.episode_number === episode);
            if (episodeData && episodeData.name) {
                newName += ` - ${episodeData.name}`;
            }
        }
    } else if (metadata.type === 'manual') {
        // Manual entry format: Title - S01E01
        const season = metadata.season || parsed.season || 1;
        const episode = parsed.episode || episodeNumber;
        newName = `${metadata.title} - S${season.toString().padStart(2, '0')}E${episode.toString().padStart(2, '0')}`;
    } else {
        newName = metadata.title || metadata.name || parsed.title;
    }
    
    // Clean special characters
    newName = newName.replace(/[<>:"/\\|?*]/g, '');
    
    return `${newName}${extension}`;
}

// Generate new filename (legacy function - for backward compatibility)
function generateNewFileName(parsed, extension) {
    let newName = '';
    
    if (parsed.type === 'movie') {
        newName = `${parsed.title} (${parsed.year})`;
    } else if (parsed.type === 'series') {
        newName = `${parsed.title} - S${parsed.season.toString().padStart(2, '0')}E${parsed.episode.toString().padStart(2, '0')}`;
    } else {
        newName = parsed.title;
    }
    
    // Clean special characters
    newName = newName.replace(/[<>:"/\\|?*]/g, '');
    
    return `${newName}${extension}`;
}

// Display preview
function displayPreview(data) {
    previewList.innerHTML = '';
    
    // Get selected sort type
    const sortType = document.querySelector('input[name="sortType"]:checked').value;
    
    // Create a copy of data to sort
    let sortedData = [...data];
    
    // Sort data based on selected type (only left side - old names)
    switch(sortType) {
        case 'name':
            sortedData.sort((a, b) => a.oldName.localeCompare(b.oldName, undefined, { numeric: true }));
            break;
        case 'date':
            // Find corresponding file data for date sorting
            sortedData.sort((a, b) => {
                const fileA = mediaFiles.find(f => f.path === a.oldPath);
                const fileB = mediaFiles.find(f => f.path === b.oldPath);
                return new Date(fileB.modified) - new Date(fileA.modified);
            });
            break;
        case 'size':
            // Find corresponding file data for size sorting
            sortedData.sort((a, b) => {
                const fileA = mediaFiles.find(f => f.path === a.oldPath);
                const fileB = mediaFiles.find(f => f.path === b.oldPath);
                return fileB.size - fileA.size;
            });
            break;
        default:
            sortedData.sort((a, b) => a.oldName.localeCompare(b.oldName, undefined, { numeric: true }));
    }
    
    // Now regenerate new names based on sorted order
    sortedData.forEach((item, index) => {
        const parsed = parseFileName(item.oldName);
        const newName = generateNewFileNameWithMetadata(selectedMedia, parsed, path.extname(item.oldName), index + 1);
        
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        
        previewItem.innerHTML = `
            <div class="old-name">${item.oldName}</div>
            <div class="arrow">→</div>
            <div class="new-name">${newName}</div>
        `;
        
        previewList.appendChild(previewItem);
    });
    
    // Update renameData with new order
    renameData = sortedData.map((item, index) => {
        const parsed = parseFileName(item.oldName);
        const newName = generateNewFileNameWithMetadata(selectedMedia, parsed, path.extname(item.oldName), index + 1);
        const newPath = path.join(path.dirname(item.oldPath), newName);
        
        return {
            oldPath: item.oldPath,
            newPath: newPath,
            oldName: item.oldName,
            newName: newName,
            parsed: parsed
        };
    });
}

// Rename files
async function renameFiles() {
    if (renameData.length === 0) return;
    
    const confirmed = confirm(`${renameData.length} files will be renamed. Do you want to continue?`);
    if (!confirmed) return;
    
    showLoading(true);
    
    try {
        const results = await ipcRenderer.invoke('rename-files', renameData);
        displayResults(results);
        resultsSection.style.display = 'block';
        
        // Count successful operations
        const successCount = results.filter(r => r.success).length;
        alert(`${successCount}/${results.length} files successfully renamed!`);
        
    } catch (error) {
        console.error('Renaming error:', error);
        alert('Error occurred while renaming files!');
    } finally {
        showLoading(false);
    }
}

// Display results
function displayResults(results) {
    resultsList.innerHTML = '';
    
    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${result.success ? 'success' : 'error'}`;
        
        const statusIcon = result.success ? '✅' : '❌';
        const statusText = result.success ? 'Success' : 'Error';
        
        resultItem.innerHTML = `
            <div class="status-icon">${statusIcon}</div>
            <div class="file-info">
                <div class="file-name">${statusText}</div>
                <div class="file-details">
                    ${path.basename(result.oldPath)} → ${path.basename(result.newPath)}
                    ${result.error ? `<br><small style="color: #f44336;">${result.error}</small>` : ''}
                </div>
            </div>
        `;
        
        resultsList.appendChild(resultItem);
    });
}

// Helper functions
function getFileIcon(extension) {
    const icons = {
        '.mp4': '🎬',
        '.mkv': '🎬',
        '.avi': '🎬',
        '.mov': '🎬',
        '.wmv': '🎬',
        '.flv': '🎬',
        '.webm': '🎬',
        '.m4v': '🎬'
    };
    return icons[extension] || '📄';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showLoading(show) {
    loading.style.display = show ? 'flex' : 'none';
}

// Settings functions
function openSettings() {
    settingsModal.style.display = 'flex';
    loadApiKey();
}

function closeSettings() {
    settingsModal.style.display = 'none';
}

function loadApiKey() {
    // Load API key from localStorage
    const savedApiKey = localStorage.getItem('tmdb_api_key');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
        updateApiStatus(true);
    } else {
        apiKeyInput.value = '';
        updateApiStatus(false);
    }
}

function saveApiKey() {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        alert('Please enter an API key!');
        return;
    }
    
    // Save to localStorage
    localStorage.setItem('tmdb_api_key', apiKey);
    updateApiStatus(true);
    alert('API key saved successfully!');
}

function clearApiKey() {
    if (confirm('Are you sure you want to clear the API key?')) {
        localStorage.removeItem('tmdb_api_key');
        apiKeyInput.value = '';
        updateApiStatus(false);
        alert('API key cleared!');
    }
}

function updateApiStatus(hasKey) {
    const indicator = apiStatus.querySelector('.status-indicator');
    const text = apiStatus.querySelector('.status-text');
    
    if (hasKey) {
        indicator.textContent = '✅';
        text.textContent = 'API key configured';
        apiStatus.style.background = '#d4edda';
        apiStatus.style.borderLeft = '4px solid #28a745';
    } else {
        indicator.textContent = '❌';
        text.textContent = 'No API key configured';
        apiStatus.style.background = '#f8d7da';
        apiStatus.style.borderLeft = '4px solid #dc3545';
    }
}

// Get API key from localStorage
function getApiKey() {
    return localStorage.getItem('tmdb_api_key') || 'YOUR_TMDB_API_KEY_HERE';
}

// Manual entry functions
function confirmManualSeries() {
    const seriesName = manualSeriesName.value.trim();
    const seasonNumber = parseInt(manualSeasonNumber.value) || 1;
    
    if (!seriesName) {
        alert('Please enter a series name!');
        return;
    }
    
    if (seasonNumber < 1 || seasonNumber > 99) {
        alert('Please enter a valid season number (1-99)!');
        return;
    }
    
    // Create manual media object
    selectedMedia = {
        id: 'manual',
        title: seriesName,
        name: seriesName,
        type: 'manual',
        season: seasonNumber
    };
    
    // Hide media section
    mediaSection.style.display = 'none';
    
    // Always show preview - files should be scanned when folder is selected
    console.log('Manual series confirmed:', seriesName);
    console.log('Media files count:', mediaFiles.length);
    
    // Generate rename data and show preview
    const data = generateRenameData();
    console.log('Generated rename data:', data);
    
    if (data.length > 0) {
        displayPreview(data);
        previewSection.style.display = 'block';
        renameBtn.disabled = false; // Enable rename button
    } else {
        // If no files, show message
        alert('No media files found in the selected folder. Please select a folder with media files first.');
    }
}

// Season confirmation function
async function confirmSeason() {
    const seasonNum = parseInt(seasonNumber.value) || 1;
    
    if (seasonNum < 1 || seasonNum > 99) {
        alert('Please enter a valid season number (1-99)!');
        return;
    }
    
    // Add season to selectedMedia
    selectedMedia.season = seasonNum;
    
    showLoading(true);
    
    try {
        // Fetch episode information from TMDB
        const userApiKey = getApiKey();
        const episodes = await ipcRenderer.invoke('get-tv-episodes', selectedMedia.id, seasonNum, userApiKey);
        
        // Add episodes to selectedMedia
        selectedMedia.episodes = episodes;
        
        console.log('Episodes loaded:', episodes);
        
    } catch (error) {
        console.error('Episode loading error:', error);
        // Continue without episodes if API fails
    } finally {
        showLoading(false);
    }
    
    // Hide season selection and media section
    seasonSelection.style.display = 'none';
    mediaSection.style.display = 'none';
    
    // Show preview
    if (mediaFiles.length > 0) {
        const data = generateRenameData();
        displayPreview(data);
        previewSection.style.display = 'block';
        renameBtn.disabled = false;
    }
}

// Language Management Functions
async function loadLanguagePreference() {
    const savedLanguage = localStorage.getItem('smartren_language') || 'en-US';
    console.log('Loading language preference:', savedLanguage);
    
    languageSelect.value = savedLanguage;
    updateLanguageStatus(savedLanguage);
    
    // Update TMDB API language in main process
    try {
        const success = await ipcRenderer.invoke('set-tmdb-language', savedLanguage);
        if (success) {
            console.log('TMDB API language loaded in main process:', savedLanguage);
        } else {
            console.error('Failed to load TMDB API language in main process');
        }
    } catch (error) {
        console.error('Error loading TMDB API language:', error);
    }
    
    // Also update local TMDB API instance if available
    if (window.tmdbAPI) {
        window.tmdbAPI.setLanguage(savedLanguage);
        console.log('Local TMDB API language loaded:', savedLanguage);
        console.log('Current local TMDB API language:', window.tmdbAPI.getLanguage());
    }
}

async function saveLanguagePreference() {
    const selectedLanguage = languageSelect.value;
    console.log('=== SAVE LANGUAGE CLICKED ===');
    console.log('Saving language preference:', selectedLanguage);
    
    // Save to localStorage
    localStorage.setItem('smartren_language', selectedLanguage);
    console.log('Language saved to localStorage:', selectedLanguage);
    
    // Update TMDB API language in main process
    try {
        const success = await ipcRenderer.invoke('set-tmdb-language', selectedLanguage);
        if (success) {
            console.log('TMDB API language updated in main process:', selectedLanguage);
        } else {
            console.error('Failed to update TMDB API language in main process');
        }
    } catch (error) {
        console.error('Error updating TMDB API language:', error);
    }
    
    // Also update local TMDB API instance if available
    if (window.tmdbAPI) {
        console.log('TMDB API available, updating local language...');
        window.tmdbAPI.setLanguage(selectedLanguage);
        console.log('Local TMDB API language updated to:', selectedLanguage);
        console.log('Current local TMDB API language:', window.tmdbAPI.getLanguage());
    }
    
    updateLanguageStatus(selectedLanguage);
    
    // Show success message
    console.log('About to show notification...');
    const config = require('./config');
    const languageNames = config.SUPPORTED_LANGUAGES;
    const languageName = languageNames[selectedLanguage] || selectedLanguage;
    console.log('Language name for notification:', languageName);
    showNotification(`✅ Language saved successfully! Content will now be displayed in ${languageName}`, 'success');
    console.log('Notification called');
}

function updateLanguageStatus(language) {
    const config = require('./config');
    const languageNames = config.SUPPORTED_LANGUAGES;
    
    const statusText = `Current: ${languageNames[language] || language}`;
    const statusIndicator = languageNames[language] ? languageNames[language].split(' ')[0] : '🌍';
    
    languageStatus.querySelector('.status-indicator').textContent = statusIndicator;
    languageStatus.querySelector('.status-text').textContent = statusText;
}

// Notification function
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .notification-icon {
            font-size: 18px;
        }
        .notification-message {
            flex: 1;
            font-weight: 500;
        }
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .notification-close:hover {
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
        }
    `;
    
    if (!document.querySelector('#notification-styles')) {
        style.id = 'notification-styles';
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        if (notification.parentNode) {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    });
}

// Language event listeners
saveLanguageBtn.addEventListener('click', saveLanguagePreference);

// Debug: Dil değişikliğini test et
window.testLanguageChange = async function() {
    console.log('=== Testing Language Change ===');
    console.log('localStorage language:', localStorage.getItem('smartren_language'));
    console.log('languageSelect value:', languageSelect.value);
    
    if (window.tmdbAPI) {
        console.log('Current TMDB API language:', window.tmdbAPI.getLanguage());
        window.tmdbAPI.setLanguage('tr-TR');
        console.log('New TMDB API language:', window.tmdbAPI.getLanguage());
    } else {
        console.log('TMDB API not available');
        console.log('Trying to get TMDB API...');
        try {
            window.tmdbAPI = await ipcRenderer.invoke('get-tmdb-api');
            if (window.tmdbAPI) {
                console.log('TMDB API obtained successfully');
                console.log('Current TMDB API language:', window.tmdbAPI.getLanguage());
            }
        } catch (error) {
            console.error('Error getting TMDB API:', error);
        }
    }
    console.log('=== End Test ===');
};

// Load language preference on startup
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // TMDB API instance'ını al
        window.tmdbAPI = await ipcRenderer.invoke('get-tmdb-api');
        console.log('TMDB API loaded successfully');
        
        // Dil tercihini yükle
        await loadLanguagePreference();
    } catch (error) {
        console.error('Error loading TMDB API:', error);
    }
});
