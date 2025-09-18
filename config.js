// TMDB API Configuration
// Users now provide their own API keys through the Settings UI
// This file is kept for future configuration needs

module.exports = {
    // API key is now managed by users through the application settings
    // Users can set their own TMDB API key via Settings > API Configuration
    
    // Language settings
    DEFAULT_LANGUAGE: 'en-US', // Default: English
    SUPPORTED_LANGUAGES: {
        'en-US': '🇺🇸 English',
        'tr-TR': '🇹🇷 Türkçe',
        'es-ES': '🇪🇸 Español',
        'fr-FR': '🇫🇷 Français',
        'de-DE': '🇩🇪 Deutsch',
        'it-IT': '🇮🇹 Italiano',
        'pt-BR': '🇧🇷 Português',
        'ru-RU': '🇷🇺 Русский',
        'ja-JP': '🇯🇵 日本語',
        'ko-KR': '🇰🇷 한국어',
        'zh-CN': '🇨🇳 中文'
    },
    
    // 🆓 HOW TO GET A FREE TMDB API KEY:
    // 1. Go to https://www.themoviedb.org/settings/api
    // 2. Create a free account (register with email)
    // 3. Click "Request an API Key"
    // 4. Select "Developer" (free option)
    // 5. Fill in your details
    // 6. Copy the API key and paste it in the app settings
};
