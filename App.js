import React, { useState } from 'react'
import 'src/App.css'

// URL de base de votre backend
const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [videoUrl, setVideoUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [videoData, setVideoData] = useState(null)
  const [selectedFormat, setSelectedFormat] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [currentStep, setCurrentStep] = useState(1)

  const showNotification = (message, type = 'info') => {
    const id = Date.now()
    const newNotification = { id, message, type }
    setNotifications(prev => [...prev, newNotification])
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(notif => notif.id !== id))
    }, 4000)
  }

  const analyzeVideo = async () => {
    if (!videoUrl.trim()) {
      showNotification('❌ Veuillez coller un lien Facebook', 'error')
      return
    }

    setIsLoading(true)
    setCurrentStep(2)

    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl: videoUrl.trim() })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'analyse');
      }

      if (!result.success) {
        throw new Error(result.error || 'Échec de l\'analyse');
      }

      setVideoData(result.data)
      setCurrentStep(3)
      showNotification('✅ Vidéo analysée avec succès !', 'success')

    } catch (error) {
      console.error('Erreur analyse:', error);
      showNotification(`❌ ${error.message}`, 'error')
      setCurrentStep(1)
    } finally {
      setIsLoading(false)
    }
  }

  const selectFormat = (format) => {
    setSelectedFormat(format)
    showNotification(`✅ Format ${format.toUpperCase()} sélectionné`, 'info')
  }

  const downloadVideo = async () => {
    if (!videoData) {
      showNotification('❌ Veuillez d\'abord analyser une vidéo', 'error')
      return
    }

    if (!selectedFormat) {
      showNotification('❌ Veuillez sélectionner un format', 'error')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl: videoData.url,
          quality: selectedFormat,
          format: selectedFormat === 'mp3' ? 'mp3' : 'mp4'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors du téléchargement');
      }

      if (!result.success) {
        throw new Error(result.error || 'Échec du téléchargement');
      }

      // Utiliser l'URL de téléchargement du backend
      processDownload(result.data)

    } catch (error) {
      console.error('Erreur téléchargement:', error);
      showNotification(`❌ ${error.message}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const processDownload = (downloadData) => {
    const link = document.createElement('a')
    link.href = downloadData.downloadUrl
    link.download = downloadData.filename
    link.style.display = 'none'
    link.target = '_blank' // Ouvrir dans un nouvel onglet
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setCurrentStep(5)
    showNotification('📥 Téléchargement démarré !', 'success')
  }

  const newVideo = () => {
    setVideoUrl('')
    setVideoData(null)
    setSelectedFormat(null)
    setCurrentStep(1)
    showNotification('✨ Prêt pour une nouvelle vidéo !', 'info')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      analyzeVideo()
    }
  }

  return (
    <div>
      {/* Notifications */}
      <div className="notification-container">
        {notifications.map(notif => (
          <div key={notif.id} className={`alert alert-${notif.type} notification fade show`}>
            {notif.message}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
            ></button>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <nav className="navbar navbar-dark glass-card fixed-top m-3">
        <div className="container">
          <a className="navbar-brand fw-bold" href="#">
            <i className="fab fa-facebook me-2"></i>
            FB Downloader Pro
          </a>
        </div>
      </nav>

      <div className="container" style={{ paddingTop: '120px' }}>
        <div className="main-container p-4">
          
          {/* Étape 1: Input URL */}
          {currentStep >= 1 && (
            <div className="glass-card p-4 mb-4 text-white">
              <h4><i className="fas fa-link me-2"></i>Collez votre lien Facebook</h4>
              <div className="input-group mb-3">
                <input 
                  type="text" 
                  className="form-control form-control-lg" 
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="https://www.facebook.com/watch/?v=..."
                />
                <button 
                  className="btn btn-warning text-dark fw-bold ms-2"
                  onClick={analyzeVideo}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <><i className="fas fa-spinner fa-spin me-2"></i>Analyse...</>
                  ) : (
                    <><i className="fas fa-bolt me-2"></i>Analyser</>
                  )}
                </button>
              </div>
              <small><i className="fas fa-info-circle me-1"></i> Tous les liens Facebook acceptés</small>
            </div>
          )}

          {/* Étape 2: Loading */}
          {currentStep === 2 && (
            <div className="glass-card p-4 mb-4 text-center text-white">
              <div className="spinner-border text-primary mb-3"></div>
              <h5>Analyse en cours...</h5>
              <p>Connexion au serveur...</p>
            </div>
          )}

          {/* Étape 3: Aperçu */}
          {currentStep >= 3 && videoData && (
            <div className="glass-card p-4 mb-4 text-white">
              <h4><i className="fas fa-play-circle me-2"></i>Vidéo Trouvée</h4>
              <div className="text-center">
                <img 
                  src={videoData.thumbnail} 
                  className="img-fluid rounded mb-3" 
                  style={{maxHeight: '200px'}}
                  alt="Miniature" 
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Video+Facebook'
                  }}
                />
                <h5>{videoData.title}</h5>
                <p>Durée: {videoData.duration} | Qualités disponibles: {videoData.qualities.join(', ')}</p>
                
                <button 
                  className="btn btn-primary mt-2"
                  onClick={() => setCurrentStep(4)}
                >
                  <i className="fas fa-arrow-right me-2"></i>Choisir le format
                </button>
              </div>
            </div>
          )}

          {/* Étape 4: Options */}
          {currentStep >= 4 && videoData && (
            <div className="glass-card p-4 mb-4 text-white">
              <h4><i className="fas fa-download me-2"></i>Options de Téléchargement</h4>
              
              <div className="row g-3 mb-4">
                {videoData.qualities.map(quality => (
                  <div key={quality} className="col-md-3">
                    <div 
                      className={`format-badge text-center p-3 ${
                        selectedFormat === quality 
                          ? quality === 'mp3' ? 'bg-warning text-dark' : `bg-${quality === 'hd' ? 'primary' : quality === 'sd' ? 'success' : 'info'} text-white`
                          : 'bg-secondary text-white'
                      }`}
                      onClick={() => selectFormat(quality)}
                    >
                      <i className={`fas fa-${quality === 'mp3' ? 'music' : 'video'} fa-2x mb-2`}></i>
                      <div>
                        {quality === 'hd' && 'HD 1080p'}
                        {quality === 'sd' && 'SD 720p'} 
                        {quality === 'low' && '360p'}
                        {quality === 'mp3' && 'MP3'}
                      </div>
                      <small>
                        {quality === 'hd' && 'Haute qualité'}
                        {quality === 'sd' && 'Qualité standard'}
                        {quality === 'low' && 'Pour mobile'}
                        {quality === 'mp3' && 'Audio seulement'}
                      </small>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <button 
                  className="btn download-btn btn-lg"
                  onClick={downloadVideo}
                  disabled={!selectedFormat || isLoading}
                >
                  {isLoading ? (
                    <><i className="fas fa-spinner fa-spin me-2"></i>Téléchargement...</>
                  ) : (
                    <><i className="fas fa-download me-2"></i>Télécharger</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Étape 5: Résultats */}
          {currentStep === 5 && (
            <div className="glass-card p-4 text-white">
              <h4 className="text-center">
                <i className="fas fa-check-circle me-2 text-success"></i>
                Téléchargement Réussi !
              </h4>
              <div className="text-center">
                <div className="mb-4">
                  <p>Votre {selectedFormat === 'mp3' ? 'fichier audio' : 'vidéo'} a été téléchargé :</p>
                  <h5 className="text-warning">
                    facebook_{selectedFormat === 'mp3' ? 'audio' : 'video'}_{videoData?.id}.{selectedFormat === 'mp3' ? 'mp3' : 'mp4'}
                  </h5>
                  <p className="mt-3">Format: {selectedFormat?.toUpperCase()}</p>
                </div>
                <div>
                  <button className="btn btn-success me-2" onClick={downloadVideo}>
                    <i className="fas fa-redo me-2"></i>Télécharger à nouveau
                  </button>
                  <button className="btn btn-outline-light" onClick={newVideo}>
                    <i className="fas fa-plus me-2"></i>Nouvelle vidéo
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <footer className="text-white text-center py-4 mt-5">
        <p>&copy; 2025 1èreF3C_😎 FB Downloader Pro - Daniel_Tech</p>
      </footer>
    </div>
  )
}

export default App