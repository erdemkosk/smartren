const config = require('./config');

class TMDBAPI {
    constructor() {
        // TMDB API anahtarı - ücretsiz alabilirsiniz: https://www.themoviedb.org/settings/api
        this.apiKey = config.TMDB_API_KEY;
        this.baseURL = 'https://api.themoviedb.org/3';
        this.imageBaseURL = 'https://image.tmdb.org/t/p/w500';
        this.language = config.DEFAULT_LANGUAGE; // Default language
        
        if (this.apiKey === 'YOUR_TMDB_API_KEY_HERE') {
            console.warn('⚠️ TMDB API anahtarı ayarlanmamış! Lütfen config.js dosyasında API anahtarınızı ayarlayın.');
        }
    }

    // Dil ayarını değiştir
    setLanguage(lang) {
        this.language = lang;
    }

    // Mevcut dili al
    getLanguage() {
        return this.language;
    }

    // Film arama
    async searchMovie(query) {
        try {
            const url = `${this.baseURL}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&language=${this.language}`;
            const response = await fetch(url);
            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error('Film arama hatası:', error);
            return [];
        }
    }

    // Dizi arama
    async searchTV(query) {
        try {
            const url = `${this.baseURL}/search/tv?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&language=${this.language}`;
            const response = await fetch(url);
            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error('Dizi arama hatası:', error);
            return [];
        }
    }

    // Film detayları
    async getMovieDetails(movieId) {
        try {
            const url = `${this.baseURL}/movie/${movieId}?api_key=${this.apiKey}&language=${this.language}`;
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Film detay hatası:', error);
            return null;
        }
    }

    // Dizi detayları
    async getTVDetails(tvId) {
        try {
            const url = `${this.baseURL}/tv/${tvId}?api_key=${this.apiKey}&language=${this.language}`;
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Dizi detay hatası:', error);
            return null;
        }
    }

    // Dizi sezonları
    async getTVSeasons(tvId) {
        try {
            const url = `${this.baseURL}/tv/${tvId}?api_key=${this.apiKey}&language=${this.language}`;
            const response = await fetch(url);
            const data = await response.json();
            return data.seasons;
        } catch (error) {
            console.error('Sezon bilgisi hatası:', error);
            return [];
        }
    }

    // Dizi bölümleri
    async getTVEpisodes(tvId, seasonNumber) {
        try {
            const url = `${this.baseURL}/tv/${tvId}/season/${seasonNumber}?api_key=${this.apiKey}&language=${this.language}`;
            const response = await fetch(url);
            const data = await response.json();
            return data.episodes;
        } catch (error) {
            console.error('Bölüm bilgisi hatası:', error);
            return [];
        }
    }

    // Poster URL'i oluşturma
    getPosterURL(posterPath) {
        if (!posterPath) return null;
        return `${this.imageBaseURL}${posterPath}`;
    }

    // Dosya adından film/dizi bilgisi çıkarma
    parseFileName(fileName) {
        const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
        
        // Film formatları
        const moviePatterns = [
            /^(.+?)\.(\d{4})\.(.+)$/,  // Movie.Name.2023.1080p
            /^(.+?)\s*\((\d{4})\)$/,   // Movie Name (2023)
            /^(.+?)\s*(\d{4})$/,       // Movie Name 2023
        ];

        // Dizi formatları
        const tvPatterns = [
            /^(.+?)\.S(\d{1,2})E(\d{1,2})\.(.+)$/,  // Series.Name.S01E01.1080p
            /^(.+?)\s*S(\d{1,2})E(\d{1,2})$/,        // Series Name S01E01
            /^(.+?)\.S(\d{1,2})\.(.+)$/,             // Series.Name.S01.1080p
        ];

        // Dizi formatını kontrol et
        for (const pattern of tvPatterns) {
            const match = nameWithoutExt.match(pattern);
            if (match) {
                return {
                    type: 'tv',
                    title: match[1].replace(/\./g, ' ').trim(),
                    season: parseInt(match[2]),
                    episode: match[3] ? parseInt(match[3]) : null,
                    quality: match[4] || ''
                };
            }
        }

        // Film formatını kontrol et
        for (const pattern of moviePatterns) {
            const match = nameWithoutExt.match(pattern);
            if (match) {
                return {
                    type: 'movie',
                    title: match[1].replace(/\./g, ' ').trim(),
                    year: parseInt(match[2]),
                    quality: match[3] || ''
                };
            }
        }

        // Basit format
        return {
            type: 'unknown',
            title: nameWithoutExt.replace(/\./g, ' ').trim()
        };
    }

    // Plex formatında dosya adı oluşturma
    generatePlexFileName(metadata, fileInfo, episodeNumber = null) {
        let fileName = '';
        
        if (metadata.type === 'movie') {
            // Film formatı: Movie Name (2023)
            fileName = `${metadata.title} (${metadata.year})`;
        } else if (metadata.type === 'tv') {
            // Dizi formatı: Series Name - S01E01 - Episode Title
            const season = fileInfo.season.toString().padStart(2, '0');
            const episode = (episodeNumber || fileInfo.episode || 1).toString().padStart(2, '0');
            fileName = `${metadata.title} - S${season}E${episode}`;
            
            // Bölüm başlığı varsa ekle
            if (metadata.episodeTitle) {
                fileName += ` - ${metadata.episodeTitle}`;
            }
        } else {
            // Bilinmeyen format
            fileName = metadata.title;
        }

        // Özel karakterleri temizle
        fileName = fileName.replace(/[<>:"/\\|?*]/g, '');
        
        return fileName;
    }
}

module.exports = TMDBAPI;
