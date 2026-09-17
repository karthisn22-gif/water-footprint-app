import React, { useState, useContext, useRef, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { MapPin, UploadCloud, Loader2, Save, Trash2, Droplets, Type, Camera, Image as ImageIcon, Info, CalendarDays, Timer, Bug } from 'lucide-react';
import { motion } from 'framer-motion';
import WebcamCapture from '../components/WebcamCapture';

const irrigationImages = {
  'Drip': '/images/drip irrigation.jpg',
  'Sprinkler': '/images/sprinkler_irrigation.webp',
  'Flood': '/images/Flood-Irrigation-Cover.jpg',
  'Rain-fed': '/images/rain-fed.jpeg',
  'Micro-Sprinkler': '/images/Micro-Sprinklers.jpg',
  'Subsurface Drip': '/images/SubsurfaceDripIrrigation.jpg'
};

const Home = () => {
  const { t, i18n } = useTranslation();
  const { user } = useContext(AuthContext);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(() => sessionStorage.getItem('calc_imagePreview') || null);
  const [cropText, setCropText] = useState(() => sessionStorage.getItem('calc_cropText') || '');
  const [inputMode, setInputMode] = useState(() => sessionStorage.getItem('calc_inputMode') || 'upload');
  const [location, setLocation] = useState(() => sessionStorage.getItem('calc_location') || '');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [result, setResult] = useState(() => {
    const saved = sessionStorage.getItem('calc_result');
    return saved ? JSON.parse(saved) : null;
  });
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Sync to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('calc_location', location);
    sessionStorage.setItem('calc_cropText', cropText);
    sessionStorage.setItem('calc_inputMode', inputMode);
  }, [location, cropText, inputMode]);

  useEffect(() => {
    if (result) {
      sessionStorage.setItem('calc_result', JSON.stringify(result));
    } else {
      sessionStorage.removeItem('calc_result');
    }
  }, [result]);

  const handleImageCapture = (file) => {
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      try {
        sessionStorage.setItem('calc_imagePreview', reader.result);
      } catch (e) {
        console.warn("Image too large for sessionStorage");
      }
    };
    reader.readAsDataURL(file);
    setResult(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageCapture(file);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Use BigDataCloud for free reverse geocoding without CORS/User-Agent issues
          const res = await axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          if (res.data && res.data.city) {
            setLocation(res.data.city || res.data.locality || `${latitude}, ${longitude}`);
          } else {
            setLocation(`${latitude}, ${longitude}`);
          }
        } catch (error) {
          console.error("Error fetching location details:", error);
          setLocation(`${latitude}, ${longitude}`);
        } finally {
          setLocationLoading(false);
        }
      }, (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location. Please enter it manually.");
        setLocationLoading(false);
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleAnalyze = async () => {
    if ((inputMode === 'upload' || inputMode === 'camera') && !image) {
      alert("Please provide an image");
      return;
    }
    if (inputMode === 'text' && !cropText.trim()) {
      alert("Please enter a crop name");
      return;
    }
    if (!location) {
      alert("Please provide a location");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    if ((inputMode === 'upload' || inputMode === 'camera') && image) {
      formData.append('image', image);
    } else if (inputMode === 'text') {
      formData.append('cropNameInput', cropText.trim());
    }
    formData.append('location', location);
    formData.append('language', i18n.language);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch (error) {
      console.error('Error analyzing data:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.raw || 'Failed to analyze image. Please try again.';
      alert(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result || !user) return;
    setSaving(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/history`, {
        userId: user._id,
        // TODO: swap base64 with S3 url later
        cropName: result.cropName,
        imageUrl: imagePreview,
        location: location || 'Unknown',
        waterFootprint: result.waterFootprint,
        suitabilityCategory: result.suitabilityCategory,
        irrigationMethod: result.irrigationMethod,
        suitability: result.suitability,
        plantingSeason: result.plantingSeason,
        growthDuration: result.growthDuration,
        pestsAndCare: result.pestsAndCare,
        language: i18n.language
      });
      alert('Saved to history!');
    } catch (error) {
      console.error('Error saving history:', error);
      alert('Failed to save to history.');
    } finally {
      setSaving(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    setResult(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  }

  const clearText = () => {
    setCropText('');
    setResult(null);
  }

  const handleTabChange = (mode) => {
    setInputMode(mode);
    setResult(null);
    if (mode === 'camera') {
      setImage(null);
      setImagePreview(null);
    }
  }

  return (
    <div className="home-container">
      <motion.div 
        className={`calculator-card ${result ? 'has-results' : ''}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="home-left-col">
          <h2 className="title">{t('app_title')}</h2>
        
        {/* Input Mode Tabs */}
        <div className="input-tabs">
          <button 
            className={`tab-btn ${inputMode === 'text' ? 'active' : ''}`}
            onClick={() => handleTabChange('text')}
          >
            <Type size={18} /> {t('mode_text')}
          </button>
          <button 
            className={`tab-btn ${inputMode === 'upload' ? 'active' : ''}`}
            onClick={() => handleTabChange('upload')}
          >
            <ImageIcon size={18} /> {t('mode_upload')}
          </button>
          <button 
            className={`tab-btn ${inputMode === 'camera' ? 'active' : ''}`}
            onClick={() => handleTabChange('camera')}
          >
            <Camera size={18} /> {t('mode_camera')}
          </button>
        </div>

        {/* Input Section */}
        <div className="upload-section">
          {inputMode === 'text' && (
            <div className="text-input-container">
              <input 
                type="text" 
                value={cropText} 
                onChange={(e) => { setCropText(e.target.value); setResult(null); }} 
                placeholder={t('enter_crop_name')} 
                className="input-field crop-text-input"
              />
              {cropText && (
                <button className="btn-icon btn-clear-text" onClick={clearText}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          )}

          {inputMode === 'upload' && (
            <>
              {!imagePreview ? (
                <div className="upload-placeholder" onClick={() => fileInputRef.current.click()}>
                  <UploadCloud size={48} className="icon-blue" />
                  <p>{t('upload_image')}</p>
                </div>
              ) : (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Crop preview" className="image-preview" />
                  <button className="btn-icon btn-clear" onClick={clearImage}>
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange} 
                ref={fileInputRef}
                style={{ display: 'none' }}
              />
            </>
          )}

          {inputMode === 'camera' && (
            <>
              {!imagePreview ? (
                <WebcamCapture onCapture={handleImageCapture} />
              ) : (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Crop preview" className="image-preview" />
                  <button className="btn-icon btn-clear" onClick={clearImage}>
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Location Section */}
        <div className="location-section">
          <label>{t('location')}</label>
          <div className="location-input-group">
            <input 
              type="text" 
              placeholder={t('enter_location')} 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              className="input-field"
            />
            <button onClick={getLocation} disabled={locationLoading} className="btn-location" title={t('use_gps')}>
              <MapPin size={20} className={locationLoading ? "spinner" : ""} />
            </button>
          </div>
        </div>
        {/* Action Button */}
        <button 
          onClick={handleAnalyze} 
          disabled={loading || (!location) || (inputMode === 'text' ? !cropText.trim() : !image)} 
          className="btn-primary"
        >
          {loading ? <><Loader2 className="spinner" size={20} /> {inputMode === 'text' ? t('analyze') + '...' : t('uploading')}</> : t('analyze')}
        </button>
        </div> {/* End left col */}

        {/* Results Section */}
        {result && (
          <div className="home-right-col">
            <motion.div 
              className="results-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
            <div className="crop-title-row">
              <h3>{result.cropName[i18n.language] || result.cropName['en']}</h3>
              {result.suitabilityCategory && (
                <span className={`badge badge-${result.suitabilityCategory.toLowerCase().replace(/\s+/g, '-')}`}>
                  {t(`cat_${result.suitabilityCategory.toLowerCase().replace(/\s+/g, '_')}`)}
                </span>
              )}
            </div>

            <div className="bento-grid">
              {/* Suitability Box (Full Width) */}
              <div className="bento-item bento-full">
                <h4 className="bento-header">{t('suitability')}</h4>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  {result.suitability[i18n.language] || result.suitability['en']}
                </p>
              </div>

              {/* Water Metrics (Full Width) */}
              <div className="bento-item bento-full">
                {(() => {
                  const green = Number(result.waterFootprint.green) || 0;
                  const blue = Number(result.waterFootprint.blue) || 0;
                  const grey = Number(result.waterFootprint.grey) || 0;
                  const total = green + blue + grey;
                  return (
                    <>
                      <div className="total-water">
                        Total Water Footprint: {total} <span>{t('liters_per_kg')}</span>
                      </div>
                      <div className="water-metrics" style={{ marginBottom: 0 }}>
                  <div className="metric-card green">
                    <div className="metric-header">
                      <Droplets size={16} /> {t('green_water')}
                      <div className="tooltip-container" tabIndex="0">
                        <Info size={14} className="info-icon" />
                        <span className="tooltip-text">{t('tooltip_green')}</span>
                      </div>
                    </div>
                    <div className="metric-value">{result.waterFootprint.green} <span>{t('liters_per_kg')}</span></div>
                  </div>
                  <div className="metric-card blue">
                    <div className="metric-header">
                      <Droplets size={16} /> {t('blue_water')}
                      <div className="tooltip-container" tabIndex="0">
                        <Info size={14} className="info-icon" />
                        <span className="tooltip-text">{t('tooltip_blue')}</span>
                      </div>
                    </div>
                    <div className="metric-value">{result.waterFootprint.blue} <span>{t('liters_per_kg')}</span></div>
                  </div>
                  <div className="metric-card grey">
                    <div className="metric-header">
                      <Droplets size={16} /> {t('grey_water')}
                      <div className="tooltip-container" tabIndex="0">
                        <Info size={14} className="info-icon" />
                        <span className="tooltip-text">{t('tooltip_grey')}</span>
                      </div>
                    </div>
                    <div className="metric-value">{result.waterFootprint.grey} <span>{t('liters_per_kg')}</span></div>
                  </div>
                </div>
                    </>
                  );
                })()}
              </div>

              {/* Irrigation Box (Full Width) */}
              {result.irrigationMethod && (
                <div className="bento-item bento-full" style={{ flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
                  <img 
                    src={irrigationImages[result.irrigationMethod]} 
                    alt={result.irrigationMethod} 
                    className="irrigation-img"
                  />
                  <div>
                    <h4 style={{ marginBottom: '8px' }}>{t('recommended_irrigation')}</h4>
                    <p style={{ fontWeight: 600, color: 'var(--primary-color)', fontSize: '1.1rem' }}>
                      {t(`irrigation_${result.irrigationMethod.toLowerCase().replace(/\s+/g, '_')}`)}
                    </p>
                  </div>
                </div>
              )}

              {/* Planting Season (Half Width) */}
              {result.plantingSeason && result.suitabilityCategory !== 'Poor' && result.suitabilityCategory !== 'Not Suitable' && (
                <div className="bento-item">
                  <h4 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarDays size={18} className="icon-blue" /> {t('best_planting_season')}
                  </h4>
                  <p style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                    {result.plantingSeason[i18n.language] || result.plantingSeason.en}
                  </p>
                </div>
              )}

              {/* Growth Duration (Half Width) */}
              {result.growthDuration && result.suitabilityCategory !== 'Poor' && result.suitabilityCategory !== 'Not Suitable' && (
                <div className="bento-item">
                  <h4 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Timer size={18} className="icon-blue" /> {t('growth_duration')}
                  </h4>
                  <p style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                    {result.growthDuration[i18n.language] || result.growthDuration.en}
                  </p>
                </div>
              )}

              {/* Common Pests & Care Tips (Full Width) */}
              {result.pestsAndCare && result.suitabilityCategory !== 'Poor' && result.suitabilityCategory !== 'Not Suitable' && (
                <div className="bento-item bento-full">
                  <h4 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bug size={18} className="icon-blue" /> {t('pests_and_care')}
                  </h4>
                  <ul className="pest-list">
                    {(result.pestsAndCare[i18n.language] || result.pestsAndCare.en || []).map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button onClick={handleSave} disabled={saving} className="btn-secondary" style={{ marginTop: '25px' }}>
              <Save size={18} /> {saving ? t('saving') : t('save_history')}
            </button>
          </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Home;
