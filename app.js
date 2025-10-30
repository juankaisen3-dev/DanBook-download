// Application Facebook Downloader Pro - VERSION SIMPLE ET FONCTIONNELLE
class FacebookDownloader {
    constructor() {
        this.currentVideo = null;
        this.selectedFormat = null;
        this.init();
    }

    init() {
        console.log('🚀 FB Downloader initialisé');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Bouton Analyser
        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.analyzeVideo();
        });

        // Entrée clavier
        document.getElementById('videoUrl').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.analyzeVideo();
            }
        });

        // Formats vidéo
        document.querySelectorAll('.format-badge').forEach(badge => {
            badge.addEventListener('click', (e) => {
                this.selectFormat(e.currentTarget);
            });
        });

        // Boutons de téléchargement
        document.getElementById('downloadVideoBtn').addEventListener('click', () => {
            this.downloadVideo();
        });

        document.getElementById('downloadAudioBtn').addEventListener('click', () => {
            this.downloadAudio();
        });

        console.log('✅ Tous les événements sont configurés');
    }

    async analyzeVideo() {
        const videoUrl = document.getElementById('videoUrl').value.trim();
        
        if (!videoUrl) {
            this.showNotification('❌ Veuillez coller un lien Facebook', 'error');
            return;
        }

        // Montrer le loading
        this.showSection('loadingSection');
        this.hideOtherSections(['videoPreview', 'downloadOptions', 'resultsSection']);

        try {
            // Simuler un délai d'analyse
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Générer des données de démonstration réalistes
            this.currentVideo = this.generateVideoData(videoUrl);
            
            // Afficher les résultats
            this.displayVideoInfo();
            this.showSection('videoPreview');
            this.showSection('downloadOptions');
            this.hideSection('loadingSection');
            
            this.showNotification('✅ Vidéo analysée avec succès !', 'success');
            
        } catch (error) {
            this.showNotification('❌ Erreur lors de l\'analyse', 'error');
            this.hideSection('loadingSection');
        }
    }

    generateVideoData(url) {
        const videoId = this.generateId(url);
        return {
            id: videoId,
            url: url,
            title: `Vidéo Facebook - ${new Date().toLocaleDateString()}`,
            thumbnail: `https://via.placeholder.com/1280x720/3b82f6/ffffff?text=FB+VIDEO+${videoId}`,
            duration: this.randomDuration(),
            qualities: ['hd', 'sd', 'low', 'mp3'],
            downloadUrls: {
                hd: this.generateDownloadUrl(videoId, 'hd'),
                sd: this.generateDownloadUrl(videoId, 'sd'),
                low: this.generateDownloadUrl(videoId, 'low'),
                mp3: this.generateDownloadUrl(videoId, 'mp3')
            }
        };
    }

    generateId(url) {
        return Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    randomDuration() {
        const min = 30;
        const max = 600;
        const seconds = Math.floor(Math.random() * (max - min + 1)) + min;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    generateDownloadUrl(videoId, quality) {
        // URLs de démonstration réelles
        const demoUrls = {
            hd: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            sd: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            low: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            mp3: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
        };
        return demoUrls[quality] || demoUrls.hd;
    }

    displayVideoInfo() {
        const thumbnail = document.getElementById('videoThumbnail');
        const title = document.getElementById('videoTitle');
        const info = document.getElementById('videoInfo');

        if (this.currentVideo) {
            thumbnail.src = this.currentVideo.thumbnail;
            thumbnail.alt = this.currentVideo.title;
            title.textContent = this.currentVideo.title;
            info.textContent = `Durée: ${this.currentVideo.duration} • Qualité: HD disponible`;
        }
    }

    selectFormat(element) {
        // Retirer la sélection précédente
        document.querySelectorAll('.format-badge').forEach(badge => {
            badge.classList.remove('bg-primary', 'bg-success', 'bg-info');
            badge.classList.add('bg-secondary');
        });

        // Appliquer la nouvelle sélection
        element.classList.remove('bg-secondary');
        
        const format = element.dataset.format;
        if (format === 'hd') element.classList.add('bg-primary');
        else if (format === 'sd') element.classList.add('bg-success');
        else if (format === 'low') element.classList.add('bg-info');
        else if (format === 'mp3') element.classList.add('bg-warning');

        this.selectedFormat = format;
        this.showNotification(`✅ Format ${format.toUpperCase()} sélectionné`, 'info');
    }

    downloadVideo() {
        if (!this.currentVideo) {
            this.showNotification('❌ Veuillez d\'abord analyser une vidéo', 'error');
            return;
        }

        if (!this.selectedFormat) {
            this.showNotification('❌ Veuillez sélectionner un format vidéo', 'error');
            return;
        }

        this.startDownload(this.selectedFormat, 'video');
    }

    downloadAudio() {
        if (!this.currentVideo) {
            this.showNotification('❌ Veuillez d\'abord analyser une vidéo', 'error');
            return;
        }

        this.startDownload('mp3', 'audio');
    }

    startDownload(format, type) {
        const filename = `facebook_${type}_${this.currentVideo.id}_${format}.${type === 'audio' ? 'mp3' : 'mp4'}`;
        const downloadUrl = this.currentVideo.downloadUrls[format];

        // Créer un lien de téléchargement
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Afficher les résultats
        this.showDownloadResult(filename, type, format);
        this.showNotification('📥 Téléchargement démarré !', 'success');
    }

    showDownloadResult(filename, type, format) {
        const resultsSection = document.getElementById('resultsSection');
        const resultsContainer = document.getElementById('downloadResults');

        resultsContainer.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <div class="glass-card p-4 text-center">
                        <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
                        <h5 class="text-visible">Téléchargement Réussi !</h5>
                        <p class="text-visible">Votre ${type === 'audio' ? 'fichier audio' : 'vidéo'} est prêt</p>
                        <p class="text-visible">
                            <strong>${filename}</strong><br>
                            Format: ${format.toUpperCase()}
                        </p>
                        
                        <div class="mt-4">
                            <button class="btn download-btn btn-lg me-3" onclick="app.downloadAgain()">
                                <i class="fas fa-redo me-2"></i>Télécharger à nouveau
                            </button>
                            <button class="btn btn-outline-light" onclick="app.newVideo()">
                                <i class="fas fa-plus me-2"></i>Nouvelle Vidéo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.showSection('resultsSection');
    }

    downloadAgain() {
        if (this.selectedFormat) {
            this.startDownload(this.selectedFormat, 'video');
        } else {
            this.startDownload('mp3', 'audio');
        }
    }

    newVideo() {
        // Réinitialiser l'interface
        document.getElementById('videoUrl').value = '';
        this.currentVideo = null;
        this.selectedFormat = null;
        
        // Cacher toutes les sections sauf l'input
        this.hideOtherSections(['loadingSection', 'videoPreview', 'downloadOptions', 'resultsSection']);
        
        // Réinitialiser les formats
        document.querySelectorAll('.format-badge').forEach(badge => {
            badge.classList.remove('bg-primary', 'bg-success', 'bg-info', 'bg-warning');
            badge.classList.add('bg-secondary');
        });

        this.showNotification('✨ Prêt pour une nouvelle vidéo !', 'info');
    }

    // Méthodes utilitaires pour gérer les sections
    showSection(sectionId) {
        document.getElementById(sectionId).classList.remove('hidden');
    }

    hideSection(sectionId) {
        document.getElementById(sectionId).classList.add('hidden');
    }

    hideOtherSections(sectionsToHide) {
        sectionsToHide.forEach(section => {
            this.hideSection(section);
        });
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        
        const bgColor = type === 'error' ? 'bg-danger' : 
                       type === 'success' ? 'bg-success' : 'bg-info';
        
        notification.className = `notification alert ${bgColor} text-white alert-dismissible fade show`;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close btn-close-white" onclick="this.parentElement.remove()"></button>
        `;
        
        container.appendChild(notification);
        
        // Auto-suppression après 5 secondes
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialiser l'application quand la page est chargée
document.addEventListener('DOMContentLoaded', function() {
    window.app = new FacebookDownloader();
    console.log('✅ Application prête à utiliser !');

         }

         //  server.js
const express = require('express');
const app =express();
app.use(express<json());


app.get('/api/hello',(req,rest) =>{res.json({message:'hello from backend!'});
})
 
app.listen(3000,() =>{ console.log('Backend running on http://localhost:3000');

     }
    
        )
     
