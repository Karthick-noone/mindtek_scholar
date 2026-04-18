import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Camera, Award, FolderOpen, GraduationCap, Building, Users, FileText, Briefcase, BriefcaseBusiness, Trash2, AlertCircle, XCircle, Notebook, Globe, BookOpen, UserCog } from 'lucide-react';
import Shimmer from '../../components/Shimmer/Shimmer';
import './Profile.css';
import { useScholar } from '../../hooks/useScholar';
import { secureStorage } from '../../utils/secureStorage';
import { useUploadProfileImage } from "../../hooks/useProfile";
import { useLastWorkStatus } from "../../hooks/useWorkDetails";
import ImagePreviewModal from './ImagePreviewModal';

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [hoverImage, setHoverImage] = useState(false);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [, setScholarImage] = useState(null); // Your image state

    const fileInputRef = useRef(null);

    const handleImageView = () => {
        if (scholarImage) {
            setShowImagePreview(true);
        } else {
            // Open file picker if no image
            fileInputRef.current.click();
        }
    };

    const scholar = secureStorage.getScholar();
    const { data: scholarData } = useScholar();
    // console.log("SCholar data", scholar)
    // console.log("SCholar datafhdfhdfd", scholarData)

    const scholarImage = scholarData?.scholar_profile
        ? `http://scholarapi.seasense.in/${scholarData.scholar_profile}`
        : null;

    const [formData, setFormData] = useState();
    const [workProgress, setWorkProgress] = useState(0);

    //   useEffect(() => {
    //     setTimeout(() => {
    //       setLoading(false);
    //     }, 1500);
    //   }, []);

    const { data: lastStatus } = useLastWorkStatus();

    const lastWorkStatus = lastStatus?.status;

    useEffect(() => {
        if (lastWorkStatus !== undefined) {
            setWorkProgress(Number(lastWorkStatus) || 0);
        }
    }, [lastWorkStatus]);


    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const { mutate: uploadImage } = useUploadProfileImage();

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            const formData = new FormData();
            formData.append("scholar_profile", file);

            uploadImage(formData);
        }
    };
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDeleteImage = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        const formData = new FormData();
        formData.append("remove", 1);
        uploadImage(formData);
        setShowDeleteConfirm(false);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
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

    const capsLetter = (str) => {
        if (!str) return;
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <h1>Profile Information</h1>
                <p>Manage your personal information and academic details</p>
            </div>


            <div className="profile-container">
                <div className="profile-sidebar"
                    onMouseEnter={() => setHoverImage(true)}
                    onMouseLeave={() => setHoverImage(false)}
                >

                    <div className="profile-avatar">
                        <div
                            className="avatar-premium-wrapper"
                        >
                            {scholarImage ? (
                                <img src={scholarImage} alt="Profile" className="avatar-premium-image"
                                    onClick={handleImageView}
                                />
                            ) : (
                                <div className="avatar-premium-placeholder">
                                    <span>{scholar?.user_name.charAt(0)}</span>
                                </div>
                            )}

                            <div className="camera-icon"
                                onClick={handleImageClick}

                            >
                                <Camera size={16} />
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept=".png, .jpg, .jpeg"
                                style={{ display: 'none' }}
                            />
                        </div>
                        <h2>{scholar?.user_name}</h2>
                        <p className="profile-role">Scholar</p>
                        <div className="profile-badge">
                            <span className="badge">{scholar?.user_id}</span>
                        </div>
                    </div>
                    {scholarImage && hoverImage && (
                        <div className="avatar-delete-btn"
                            onClick={handleDeleteImage}
                        >
                            <Trash2 size={15} />
                        </div>
                    )}

                    <div className="profile-contact-info">
                        <h4>Contact Information</h4>
                        <div className="contact-item">
                            <Mail size={16} />
                            <span>{scholar?.email}</span>
                        </div>
                        <div className="contact-item">
                            <Phone size={16} />
                            <span>{scholar?.contact}</span>
                        </div>
                        <div className="contact-item">
                            <Calendar size={16} />
                            <span>{new Date(scholar?.reg_date).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            })} (Reg date)</span>
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

                            <h3>
                                <BriefcaseBusiness size={20} />
                                Work Information
                            </h3>
                            <div className="form-grid">

                                <div className="form-field">
                                    <label>Domain</label>
                                    <div className="field-value">
                                        <Globe size={16} />
                                        <span>{scholarData?.domain.domain}</span>
                                    </div>
                                </div>
                                <div className="form-field">
                                    <label>Journal Index</label>
                                    <div className="field-value">
                                        <BookOpen size={16} />
                                        <span>{scholarData?.journal_index.journal_index}</span>
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label>Technical Expert</label>
                                    <div className="field-value">
                                        <UserCog size={16} />
                                        <span>{scholarData?.tech_expert.staff_name}</span>
                                    </div>
                                </div>
                                <div className="form-field">
                                    <label>Technical Expert Contact</label>
                                    <div className="field-value">
                                        <Phone size={16} />
                                        <span>+91 {scholarData?.tech_expert.staff_contact}</span>
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label>BDA Name</label>
                                    <div className="field-value">
                                        <Users size={16} />
                                        <span>{scholarData?.bda.bda_name}</span>
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label>BDA Contact</label>
                                    <div className="field-value">
                                        <Phone size={16} />
                                        <span>+91 {scholarData?.bda.bda_contact}</span>
                                    </div>
                                </div>

                                <div className="form-field full-width">
                                    <label>Work Description</label>

                                    <div className="field-value bio-text">
                                        <Notebook size={16} />
                                        <span>{scholar?.work_description}</span>
                                    </div>

                                </div>
                                <div className="form-field full-width">
                                    <div className='profile-project-section-header'>
                                        <label>Project Completion</label>
                                        <span className='work-percentage'>{workProgress}%</span>
                                    </div>

                                    <div className="profile-progress-bar-main"
                                        style={{ marginTop: '15px' }}
                                    >
                                        <div
                                            className="progress-fill-main "
                                            style={{ width: `${workProgress}%` }}
                                        >
                                            <div className="progress-glow"></div>
                                        </div>
                                    </div>
                                    <div className="progress-premium-stats">
                                        {lastStatus?.note && (<>
                                            <div className="progress-stat">
                                                <Notebook size={14} />
                                                <span>Notes:</span>
                                                {capsLetter(lastStatus?.note)}
                                            </div>
                                            <div className="progress-stat">
                                                <Calendar size={14} />
                                                {/* <span>Remaining</span> */}
                                                {new Date(lastStatus?.date).toLocaleString("en-GB", {
                                                    day: "2-digit",
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </>)}
                                        {/* <div className="progress-stat">
                  <Clock size={14} />
                  <span>Remaining</span>
                 {100 - workProgress}
                </div> */}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {showDeleteConfirm && (
                            <div className="modal-premium-overlay" onClick={cancelDelete}>
                                <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
                                    <div className="confirmation-modal-header">
                                        <AlertCircle size={24} color="#ef4444" />
                                        <h3>Delete Profile Image</h3>
                                        <button
                                            className="modal-close-icon"
                                            onClick={cancelDelete}
                                            style={{
                                                marginLeft: 'auto',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: 'var(--text-muted)'
                                            }}
                                        >
                                            <XCircle size={20} />
                                        </button>
                                    </div>
                                    <div className="confirmation-modal-body">
                                        <p>Are you sure you want to delete your profile image?</p>
                                        {/* <p className="warning-text">This action cannot be undone.</p> */}
                                    </div>
                                    <div className="confirmation-modal-footer">
                                        <button className="confirmation-btn cancel" onClick={cancelDelete}>
                                            Cancel
                                        </button>
                                        <button className="confirmation-btn delete" onClick={confirmDelete}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showImagePreview && scholarImage && (
                            <ImagePreviewModal
                                imageUrl={scholarImage}
                                onClose={() => setShowImagePreview(false)}
                                onDelete={handleDeleteImage}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;