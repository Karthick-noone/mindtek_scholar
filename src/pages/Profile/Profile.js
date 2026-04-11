import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Camera, Award, FolderOpen, GraduationCap, Building, Users, FileText, Briefcase, BriefcaseBusiness } from 'lucide-react';
import Shimmer from '../../components/Shimmer/Shimmer';
import './Profile.css';

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [hoverImage, setHoverImage] = useState(false);

  const fileInputRef = useRef(null);

    const [profile, setProfile] = useState({
        name: 'Karthick Scholar',
        email: 'karthick.scholar@example.com',
        phone: '+91 9876543210',
        address: '123 Academic Street, University City, CA 90210',
        joinDate: 'September 2023',
        department: 'Computer Science',
        studentId: 'CS2023001',
        bda: 'Dr. Sarah Johnson',
        bdaContact: '+91 8778361612',
        technicalExpert: 'Dr. Karthick',
        workDescription: 'Passionate researcher in Artificial Intelligence and Machine Learning with focus on deep learning applications.'
    });

    const [formData, setFormData] = useState(profile);
    const [workProgress, setWorkProgress] = useState(65);

    //   useEffect(() => {
    //     setTimeout(() => {
    //       setLoading(false);
    //     }, 1500);
    //   }, []);

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = () => {
        setEditing(true);
        setFormData(profile);
    };

    const handleSave = () => {
        setProfile(formData);
        setEditing(false);
    };

    const handleCancel = () => {
        setEditing(false);
        setFormData(profile);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    //   if (loading) {
    //     return (
    //       <div className="profile-page">
    //         <div className="profile-header">
    //           <Shimmer width="250px" height="32px" marginBottom="16px" />
    //           <Shimmer width="350px" height="20px" marginBottom="32px" />
    //         </div>
    //         <div className="profile-container">
    //           <Shimmer height="500px" borderRadius="16px" />
    //         </div>
    //       </div>
    //     );
    //   }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <h1>Profile Information</h1>
                <p>Manage your personal information and academic details</p>
            </div>


            <div className="profile-container">
                <div className="profile-sidebar">
                    <div className="profile-avatar">
                        <div
                            className="avatar-premium-wrapper"
                            onMouseEnter={() => setHoverImage(true)}
                            onMouseLeave={() => setHoverImage(false)}
                            onClick={handleImageClick}
                        >
                            {profileImage ? (
                                <img src={profileImage} alt="Profile" className="avatar-premium-image" />
                            ) : (
                                <div className="avatar-premium-placeholder">
                                    <span>{profile.name.charAt(0)}</span>
                                </div>
                            )}
                            {hoverImage && (
                                <div className="avatar-edit-overlay">
                                    <Camera size={24} />
                                    <span>Change Photo</span>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                        <h2>{profile.name}</h2>
                        <p className="profile-role">PhD Scholar</p>
                        <div className="profile-badge">
                            <span className="badge">{profile.studentId}</span>
                        </div>
                    </div>


                    <div className="profile-contact-info">
                        <h4>Contact Information</h4>
                        <div className="contact-item">
                            <Mail size={16} />
                            <span>{profile.email}</span>
                        </div>
                        <div className="contact-item">
                            <Phone size={16} />
                            <span>{profile.phone}</span>
                        </div>
                        <div className="contact-item">
                            <MapPin size={16} />
                            <span>{profile.address}</span>
                        </div>
                    </div>

                    {/* <div className="profile-stats">
                        <div className="stat-item">
                            <BookOpen size={20} />
                            <div className="profile-stat-info">
                                <span className="stat-label">Publications</span>
                                <span className="stat-value">8</span>
                            </div>
                        </div>
                        <div className="stat-item">
                            <Award size={20} />
                            <div className="profile-stat-info">
                                <span className="stat-label">Citations</span>
                                <span className="stat-value">156</span>
                            </div>
                        </div>
                        <div className="stat-item">
                            <FolderOpen size={20} />
                            <div className="profile-stat-info">
                                <span className="stat-label">Projects</span>
                                <span className="stat-value">5</span>
                            </div>
                        </div>
                    </div> */}

                </div>

                <div className="profile-content">
                    {/* <div className="profile-actions">
                        {!editing ? (
                            <button className="edit-btn" onClick={handleEdit}>
                                <Edit2 size={16} />
                                Edit Profile
                            </button>
                        ) : (
                            <div className="edit-actions">
                                <button className="save-btn" onClick={handleSave}>
                                    <Save size={16} />
                                    Save Changes
                                </button>
                                <button className="cancel-btn" onClick={handleCancel}>
                                    <X size={16} />
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div> */}

                    <div className="profile-form">
                        <div className="form-section">
                            {/* <h3>
                                <GraduationCap size={20} />
                                Personal Information
                            </h3> */}
                            {/* <div className="form-grid">
                                <div className="form-field">
                                    <label>Full Name</label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                            className="form-input"
                                        />
                                    ) : (
                                        <div className="field-value">
                                            <User size={16} />
                                            <span>{profile.name}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="form-field">
                                    <label>Email Address</label>
                                    {editing ? (
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter your email address"
                                            className="form-input"
                                        />
                                    ) : (
                                        <div className="field-value">
                                            <Mail size={16} />
                                            <span>{profile.email}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="form-field">
                                    <label>Phone Number</label>
                                    {editing ? (
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Enter your phone number"
                                            className="form-input"
                                        />
                                    ) : (
                                        <div className="field-value">
                                            <Phone size={16} />
                                            <span>{profile.phone}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="form-field">
                                    <label>Department</label>
                                    {editing ? (
                                        <select
                                            name="department"
                                            value={formData.department}
                                            onChange={handleChange}
                                            className="form-select"
                                        >
                                            <option value="Computer Science">Computer Science</option>
                                            <option value="Data Science">Data Science</option>
                                            <option value="Artificial Intelligence">Artificial Intelligence</option>
                                            <option value="Information Technology">Information Technology</option>
                                        </select>
                                    ) : (
                                        <div className="field-value">
                                            <Building size={16} />
                                            <span>{profile.department}</span>
                                        </div>
                                    )}
                                </div>




                                <div className="form-field full-width">
                                    <label>Address</label>
                                    {editing ? (
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            rows="3"
                                            placeholder="Enter your address"
                                            className="form-textarea"
                                        />
                                    ) : (
                                        <div className="field-value">
                                            <MapPin size={16} />
                                            <span>{profile.address}</span>
                                        </div>
                                    )}
                                </div>




                            </div> */}
                            <div className="form-section">

                                <h3>
                                    <BriefcaseBusiness size={20} />
                                    Work Information
                                </h3>
                                <div className="form-grid">

                                    <div className="form-field">
                                        <label>Date Of Registration</label>
                                        <div className="field-value">
                                            <Calendar size={16} />
                                            <span>{profile.joinDate}</span>
                                        </div>
                                    </div>

                                    <div className="form-field">
                                        <label>Technical Expert</label>
                                        <div className="field-value">
                                            <Calendar size={16} />
                                            <span>{profile.technicalExpert}</span>
                                        </div>
                                    </div>

                                    <div className="form-field">
                                        <label>BDA Name</label>
                                        <div className="field-value">
                                            <Users size={16} />
                                            <span>{profile.bda}</span>
                                        </div>
                                    </div>

                                    <div className="form-field">
                                        <label>BDA Contact</label>
                                        <div className="field-value">
                                            <Users size={16} />
                                            <span>{profile.bdaContact}</span>
                                        </div>
                                    </div>

                                    <div className="form-field full-width">
                                        <label>Work Description</label>

                                        <div className="field-value bio-text">
                                            <FileText size={16} />
                                            <span>{profile.workDescription}</span>
                                        </div>

                                    </div>
                                    <div className="form-field full-width">
                                        <div className='profile-project-section-header'>
                                            <label>Project Completion</label>
                                            <span className='work-percentage'>{workProgress}%</span>
                                        </div>

                                        <div className="progress-bar-main"
                                            style={{ marginTop: '15px' }}
                                        >
                                            <div
                                                className="progress-fill-main "
                                                style={{ width: `${workProgress}%` }}
                                            >
                                                <div className="progress-glow"></div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;