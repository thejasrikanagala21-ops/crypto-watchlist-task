import React, { useState, useRef, useEffect } from 'react';
import './Profile.css';

const Profile = ({ token, email, userName, onBack }) => {
  const [profile, setProfile] = useState({
    name: userName || 'Demo User',
    email: email || '',
    bio: 'Crypto enthusiast',
    portfolioGoal: '$100K',
    avatarPreview: null
  });
  const [editing, setEditing] = useState(false);
  const [imageControls, setImageControls] = useState({
    scale: 1,
    x: 0,
    y: 0,
    rotate: 0
  });
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (userName) setProfile(prev => ({ ...prev, name: userName }));
    if (email) setProfile(prev => ({ ...prev, email: email }));
  }, [userName, email]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatarPreview: reader.result }));
        setImageControls({ scale: 1, x: 0, y: 0, rotate: 0 });
        e.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = () => {
    console.log('Profile saved:', { ...profile, imageControls });
    setEditing(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const deleteImage = () => {
    setProfile(prev => ({ ...prev, avatarPreview: null }));
    setImageControls({ scale: 1, x: 0, y: 0, rotate: 0 });
  };

  const updateImageControl = (key, value) => {
    setImageControls(prev => ({ ...prev, [key]: value }));
  };

  const resetImageControls = () => {
    setImageControls({ scale: 1, x: 0, y: 0, rotate: 0 });
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button onClick={onBack} className="back-btn">← Back to Dashboard</button>
        <h1>Profile</h1>
      </div>

      <div className="profile-container">
        <div className="profile-card">
          {/* ADVANCED AVATAR UPLOAD + CONTROLS */}
          <div className="avatar-section">
            <div className="avatar-upload-container">
              <div 
                className="avatar-upload"
                style={profile.avatarPreview ? {
                  backgroundImage: `url(${profile.avatarPreview})`,
                  backgroundSize: `${imageControls.scale * 120}%`,
                  backgroundPosition: `${imageControls.x}px ${imageControls.y}px`,
                  backgroundRepeat: 'no-repeat',
                  transform: `rotate(${imageControls.rotate}deg)`
                } : {}}
                onClick={editing ? triggerFileInput : undefined}
              >
                {!profile.avatarPreview && (
                  <div className="avatar-placeholder">
                    {profile.name[0]?.toUpperCase() || 'D'}
                  </div>
                )}
                {editing && (
                  <div className="upload-overlay">
                    <span>📷</span>
                    <p>{profile.avatarPreview ? 'Adjust photo' : 'Click to upload'}</p>
                  </div>
                )}
              </div>
              
             
              {profile.avatarPreview && editing && (
                <div className="image-controls">
                  <div className="control-group">
                    <label>Position X:</label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={imageControls.x}
                      onChange={(e) => updateImageControl('x', parseInt(e.target.value))}
                      className="control-slider"
                    />
                    <span>{imageControls.x}px</span>
                  </div>
                  
                  <div className="control-group">
                    <label>Position Y:</label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={imageControls.y}
                      onChange={(e) => updateImageControl('y', parseInt(e.target.value))}
                      className="control-slider"
                    />
                    <span>{imageControls.y}px</span>
                  </div>
                  
                  <div className="control-group">
                    <label>Zoom:</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={imageControls.scale}
                      onChange={(e) => updateImageControl('scale', parseFloat(e.target.value))}
                      className="control-slider"
                    />
                    <span>{(imageControls.scale * 100).toFixed(0)}%</span>
                  </div>
                  
                  <div className="control-group">
                    <label>Rotate:</label>
                    <input
                      type="range"
                      min="-15"
                      max="15"
                      value={imageControls.rotate}
                      onChange={(e) => updateImageControl('rotate', parseInt(e.target.value))}
                      className="control-slider"
                    />
                    <span>{imageControls.rotate}°</span>
                  </div>

                  <div className="control-buttons">
                    <button onClick={resetImageControls} className="reset-btn">
                      Reset
                    </button>
                    <button onClick={deleteImage} className="delete-image-btn">
                      Remove Photo
                    </button>
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            {profile.avatarPreview && !editing && (
              <p className="avatar-status">Profile photo set</p>
            )}
          </div>

          {/* PROFILE FORM */}
          {editing ? (
            <div className="profile-edit">
              <input
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                placeholder="Full Name"
                className="profile-input"
              />
              <input
                value={profile.email}
                className="profile-input email-readonly"
                readOnly
              />
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                placeholder="Bio"
                className="profile-input"
                rows="3"
              />
              <input
                value={profile.portfolioGoal}
                onChange={(e) => setProfile({...profile, portfolioGoal: e.target.value})}
                placeholder="Portfolio Goal"
                className="profile-input"
              />
              <div className="profile-actions">
                <button onClick={handleProfileUpdate} className="save-btn">
                  Save Changes
                </button>
                <button onClick={() => setEditing(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-display">
              <h2>{profile.name}</h2>
              <p className="profile-email">{profile.email}</p>
              <p className="profile-bio">{profile.bio}</p>
              <div className="profile-goal">
                <strong>Portfolio Goal:</strong> {profile.portfolioGoal}
              </div>
              <button onClick={() => setEditing(true)} className="edit-btn">
                Edit Profile
              </button>
            </div>
          )}

          <div className="profile-logout-section">
            <button onClick={logout} className="logout-btn-profile">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
