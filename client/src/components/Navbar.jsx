import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Droplet, Languages, LogOut, Sun, Moon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ theme, toggleTheme }) => {
  const { logout } = useContext(AuthContext);
  const { i18n, t } = useTranslation();
  const [isLangOpen, setIsLangOpen] = React.useState(false);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ml', label: 'മലയാളം (Malayalam)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'mr', label: 'मराठी (Marathi)' }
  ];

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.custom-dropdown')) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Droplet size={24} className="icon-blue" />
        <span>{t('app_title')}</span>
      </div>
      
      <div className="nav-links">
        <Link to="/" className="nav-link">{t('home')}</Link>
        <Link to="/history" className="nav-link">{t('history')}</Link>
      </div>

      <div className="nav-actions">
        <button onClick={toggleTheme} className="theme-toggle" title="Toggle Theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <div className="custom-dropdown" onClick={() => setIsLangOpen(!isLangOpen)}>
          <div className="dropdown-trigger">
            <Languages size={18} />
            <span>{languages.find(l => l.code === i18n.language)?.label || 'English'}</span>
          </div>
          
          {isLangOpen && (
            <div className="dropdown-menu">
              {languages.map(lang => (
                <div 
                  key={lang.code}
                  className={`dropdown-item ${i18n.language === lang.code ? 'active' : ''}`}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setIsLangOpen(false);
                  }}
                >
                  {lang.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={logout} className="btn-logout" title={t('logout')}>
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
