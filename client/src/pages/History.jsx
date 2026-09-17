import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Trash2, MapPin, Loader2, Droplets, Info, CalendarDays, Timer, Bug } from 'lucide-react';
import { motion } from 'framer-motion';

const irrigationImages = {
  'Drip': '/images/drip irrigation.jpg',
  'Sprinkler': '/images/sprinkler_irrigation.webp',
  'Flood': '/images/Flood-Irrigation-Cover.jpg',
  'Rain-fed': '/images/rain-fed.jpeg',
  'Micro-Sprinkler': '/images/Micro-Sprinklers.jpg',
  'Subsurface Drip': '/images/SubsurfaceDripIrrigation.jpg'
};

const History = () => {
  const { user } = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/history?userId=${user._id}`);
      setHistory(res.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/history/${id}`);
      setHistory(history.filter(item => item._id !== id));
    } catch (error) {
      console.error('Error deleting history:', error);
    }
  };

  if (loading) {
    return <div className="loading-state"><Loader2 className="spinner" size={32} /></div>;
  }

  return (
    <div className="history-container">
      <h2>{t('history')}</h2>
      
      {history.length === 0 ? (
        <div className="empty-state">
          <p>{t('no_history')}</p>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((item, index) => (
            <motion.div 
              className="history-card" 
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Note: since we used base64/objectURL for simplicity, the image might not persist if it was a local objectURL. A real app uses S3/Cloudinary */}
              <div className="history-header">
                <div className="crop-title-row">
                  <h3>{item.cropName[i18n.language] || item.cropName['en'] || item.cropName}</h3>
                  {item.suitabilityCategory && (
                    <span className={`badge badge-${item.suitabilityCategory.toLowerCase().replace(/\s+/g, '-')}`}>
                      {t(`cat_${item.suitabilityCategory.toLowerCase().replace(/\s+/g, '_')}`)}
                    </span>
                  )}
                </div>
                <button className="btn-icon btn-delete" onClick={() => handleDelete(item._id)} title={t('delete')}>
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="history-location">
                <MapPin size={14} /> <span>{item.location}</span>
              </div>
              
              {(() => {
                const total = (Number(item.waterFootprint.green) || 0) + (Number(item.waterFootprint.blue) || 0) + (Number(item.waterFootprint.grey) || 0);
                return (
                  <div className="history-total-water">
                    Total: {total} {t('liters_per_kg')}
                  </div>
                );
              })()}

              <div className="history-metrics">
                <div>
                  <span className="dot green"></span> {item.waterFootprint.green}L
                  <div className="tooltip-container" tabIndex="0">
                    <Info size={12} className="info-icon" />
                    <span className="tooltip-text">{t('tooltip_green')}</span>
                  </div>
                </div>
                <div>
                  <span className="dot blue"></span> {item.waterFootprint.blue}L
                  <div className="tooltip-container" tabIndex="0">
                    <Info size={12} className="info-icon" />
                    <span className="tooltip-text">{t('tooltip_blue')}</span>
                  </div>
                </div>
                <div>
                  <span className="dot grey"></span> {item.waterFootprint.grey}L
                  <div className="tooltip-container" tabIndex="0">
                    <Info size={12} className="info-icon" />
                    <span className="tooltip-text">{t('tooltip_grey')}</span>
                  </div>
                </div>
              </div>
              
              <div className="history-suitability">
                <p>{item.suitability[i18n.language] || item.suitability['en'] || item.suitability}</p>
              </div>

              {item.irrigationMethod && (
                <div className="history-irrigation">
                  <div className="irrigation-content-small">
                    <img 
                      src={irrigationImages[item.irrigationMethod]} 
                      alt={item.irrigationMethod} 
                      className="irrigation-img-small"
                    />
                    <span>{t(`irrigation_${item.irrigationMethod.toLowerCase().replace(/\s+/g, '_')}`)}</span>
                  </div>
                </div>
              )}

              {item.plantingSeason && item.growthDuration && item.suitabilityCategory !== 'Poor' && item.suitabilityCategory !== 'Not Suitable' && (
                <div className="history-planting-info" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <div style={{ flex: 1, background: 'var(--surface-solid)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <CalendarDays size={14} className="icon-blue" /> {t('best_planting_season')}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '5px' }}>
                      {item.plantingSeason[i18n.language] || item.plantingSeason.en}
                    </div>
                  </div>
                  <div style={{ flex: 1, background: 'var(--surface-solid)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Timer size={14} className="icon-blue" /> {t('growth_duration')}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '5px' }}>
                      {item.growthDuration[i18n.language] || item.growthDuration.en}
                    </div>
                  </div>
                </div>
              )}

              {item.pestsAndCare && item.suitabilityCategory !== 'Poor' && item.suitabilityCategory !== 'Not Suitable' && (
                <div className="history-pests" style={{ marginTop: '10px', background: 'var(--surface-solid)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', fontWeight: 600 }}>
                    <Bug size={14} className="icon-blue" /> {t('pests_and_care')}
                  </div>
                  <ul className="pest-list" style={{ fontSize: '0.85rem' }}>
                    {(item.pestsAndCare[i18n.language] || item.pestsAndCare.en || []).map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="history-date">
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
