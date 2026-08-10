// Profile.js - Updated with Enhanced Loader
import React, { useState, useEffect, useRef } from 'react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    BookOpen,
    Award,
    GraduationCap,
    Building,
    Users,
    FileText,
    BriefcaseBusiness,
    Camera,
    Clock,
    CheckCircle,
    TrendingUp,
    Star,
    Github,
    Twitter,
    X,
    Trash,
    Trash2,
    AlertCircle,
    XCircle,
    Notebook,
    Globe,
    UserCog,
    UserCog2,
    UserPen,
    PhoneCall
} from 'lucide-react';
import './Profile.css';
import { secureStorage } from '../../utils/secureStorage';
import { useScholar } from '../../hooks/useScholar';
import { useUploadProfileImage, useDeleteProfileImage } from "../../hooks/useProfile";
import { useLastWorkStatus } from "../../hooks/useWorkDetails";
import ImagePreviewModal from './ImagePreviewModal';
import Loader from './../../components/Loader/Loader';
import { getAssetUrl } from '../../utils/getCompanyUrl';

const Profile = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [hoverImage, setHoverImage] = useState(false);
    const [hoverCamera, setHoverCamera] = useState(false);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleImageView = () => {
        if (scholarImage) {
            setShowImagePreview(true);
        } else {
            fileInputRef.current.click();
        }
    };

    const fileInputRef = useRef(null);

    const scholar = secureStorage.getScholar();
    const { data: scholarData, isLoading: scholarLoading } = useScholar();
    const { data: lastStatus, isLoading: lastStatusLoading } = useLastWorkStatus();

    const scholarImage = scholarData?.scholar_profile
        ? getAssetUrl(scholarData.scholar_profile)
        : null;

    // console.log("Scholar Image", scholarImage)

    const [workProgress, setWorkProgress] = useState(0);
    const lastWorkStatus = lastStatus?.status;

    useEffect(() => {
        if (lastWorkStatus !== undefined) {
            setWorkProgress(Number(lastWorkStatus) || 0);
        }
    }, [lastWorkStatus]);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreen = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkScreen();
        window.addEventListener("resize", checkScreen);

        return () => window.removeEventListener("resize", checkScreen);
    }, []);

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const { mutate: uploadImage } = useUploadProfileImage();

    // Toast function
    const showToast = (message, type = 'error') => {
        const existingToast = document.querySelector('.custom-toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `custom-toast-notification ${type}`;

        let iconSvg = '';
        if (type === 'success') {
            iconSvg = '<path d="M20 6L9 17l-5-5" stroke="white" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
        } else if (type === 'error') {
            iconSvg = `
      <circle cx="12" cy="12" r="10" stroke="white" fill="none" stroke-width="2"/>
      <line x1="12" y1="8" x2="12" y2="12" stroke="white" stroke-width="2" stroke-linecap="round"/>
      <line x1="12" y1="16" x2="12.01" y2="16" stroke="white" stroke-width="2" stroke-linecap="round"/>
    `;
        }

        toast.innerHTML = `
    <div class="toast-content">
      <svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        ${iconSvg}
      </svg>
      <div class="toast-message-text">
        <strong>${type === 'success' ? 'Success!' : 'Error!'}</strong>
        <span>${message}</span>
      </div>
    </div>
    <div class="toast-progress-bar"></div>
  `;

        document.body.appendChild(toast);

        setTimeout(() => {
            if (toast && toast.parentNode) {
                toast.classList.add('fade-out');
                setTimeout(() => {
                    if (toast && toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }
        }, 4000);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
            showToast(`File must be within 2 MB (selected: ${fileSizeInMB} MB)`, 'error');
            e.target.value = "";
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            showToast('Invalid file type! Please select JPEG, JPG, or PNG format.', 'error');
            e.target.value = "";
            return;
        }

        const formData = new FormData();
        formData.append("scholar_profile", file);
        setIsUploading(true)
        uploadImage(formData, {
            onSuccess: () => {
                e.target.value = "";
                showToast('Profile image uploaded successfully!', 'success');
                setIsUploading(false);

            },
            onError: (error) => {
                showToast('Failed to upload image. Please try again.', 'error');
                e.target.value = "";
                setIsUploading(false);

            }
        });
    };

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDeleteImage = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        const formData = new FormData();
        formData.append("remove", 1);
        setIsDeleting(true)
        uploadImage(formData, {
            onSuccess: () => {
                showToast('Profile image deleted successfully!', 'success');
                setShowDeleteConfirm(false);
                setIsDeleting(false)

            },
            onError: (error) => {
                showToast('Failed to delete image. Please try again.', 'error');
                setShowDeleteConfirm(false);
                setIsDeleting(false)

            }
        });
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setIsDeleting(false)
    };

    const capsLetter = (name) => {
        if (!name) return '';
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    if (scholarLoading) {
        return (
            <div className="dashboard-loader-wrapper">
                <Loader
                    type="scholar"
                    size="large"
                    text="Loading profile data...."
                />
            </div>
        );
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
                    {(hoverImage || isMobile) && scholarImage && (
                        <div className="avatar-delete-btn"
                            onClick={handleDeleteImage}
                        >
                            <Trash2 size={15} />
                        </div>
                    )}

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
                                    <span>{scholarData?.user_name.charAt(0) || 'S'}</span>
                                </div>
                            )}

                            <div className="camera-icon"
                                onClick={handleImageClick}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <span className='btn-loader'></span>
                                ) : (
                                    <Camera size={15} />
                                )}
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept=".png, .jpg, .jpeg"
                                style={{ display: 'none' }}
                                disabled={isUploading}
                            />
                        </div>
                        <h2>{scholarData?.user_name || "Scholar"}</h2>
                        <p className="profile-role">Scholar</p>
                        <div className="profile-badge">
                            <span className="badge">{scholarData?.user_id || "Scholar Id"}</span>
                        </div>
                    </div>

                    <div className="profile-contact-info">
                        <h4>Personal Information</h4>
                        <div className="contact-item">
                            <Mail size={16} />
                            <span>{scholarData?.email}</span>
                        </div>
                        <div className="contact-item">
                            <Phone size={16} />
                            <span>{scholarData?.contact}</span>
                        </div>
                        <div className="contact-item">
                            <Calendar size={16} />
                            <span>{new Date(scholar?.reg_date).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            })} (Registration date)</span>
                        </div>
                        {scholarData?.secondary_emails?.length > 0 && (
                            <>
                                <h4 style={{ marginTop: "15px" }}>Secondary Emails</h4>

                                <div className="contact-premium-list">
                                    {scholarData.secondary_emails.map((email, index) => (
                                        <div className="contact-item" key={index}>
                                            <Mail size={16} />
                                            <span>{email}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {scholarData?.secondary_contacts?.length > 0 && (
                            <>
                                <h4 style={{ marginTop: "15px" }}>Secondary Contacts</h4>
                                <div className="contact-premium-list">
                                    {scholarData.secondary_contacts.map((email, index) => (
                                        <div className="contact-item" key={index}>
                                            <PhoneCall size={16} />
                                            <span>{email}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
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

                            <h3 style={{ marginBottom: '10px' }}>
                                <BriefcaseBusiness size={20} />
                                Work Information
                            </h3>
                            <div className="form-grid">


                                <div className="form-field">
                                    <label>Domain</label>
                                    <div className="field-value">
                                        <Globe size={16} />
                                        <span>{scholarData?.domain_nm || "N/A"}</span>
                                    </div>
                                </div>
                                <div className="form-field">
                                    <label>Journal Index</label>
                                    <div className="field-value">
                                        <BookOpen size={16} />
                                        <span>{scholarData?.journal_index?.journal_index || "N/A"}</span>
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label>Technical Expert</label>
                                    <div className="field-value">
                                        <UserCog size={16} />
                                        <span>{scholarData?.tech_expert?.staff_name || "N/A"}</span>
                                    </div>
                                </div>
                                <div className="form-field">
                                    <label>Technical Expert Contact</label>
                                    <div className="field-value">
                                        <Phone size={16} />
                                        <span> {scholarData?.tech_expert?.staff_contact || "N/A"}</span>
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label>BDA Name</label>
                                    <div className="field-value">
                                        <Users size={16} />
                                        <span>{scholarData?.bda?.bda_name || "N/A"}</span>
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label>BDA Contact</label>
                                    <div className="field-value">
                                        <Phone size={16} />
                                        <span> {scholarData?.bda?.bda_contact}</span>
                                    </div>
                                </div>

                                <div className="form-field full-width">
                                    <label>Work Description</label>

                                    <div className="field-value bio-text">
                                        <Notebook size={16} />
                                        <span>{scholarData?.work_description}</span>
                                    </div>

                                </div>
                                {workProgress > 0 && (

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
                                                    {/* <Notebook size={14} /> */}
                                                    {/* <span>Notes:</span> */}
                                                    {/* {capsLetter(lastStatus?.note)} */}
                                                </div>

                                            </>
                                            )}
                                            <div className="progress-stat progress-date">
                                                {/* <span>Remaining</span> */}
                                                {lastStatus?.date && !isNaN(new Date(lastStatus.date).getTime()) && (

                                                    <>
                                                        <Calendar size={14} />

                                                        {new Date(lastStatus.date).toLocaleString("en-GB", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        })}
                                                    </>
                                                )}
                                            </div>
                                            {/* <div className="progress-stat">
                  <Clock size={14} />
                  <span>Remaining</span>
                 {100 - workProgress}
                </div> */}
                                        </div>
                                    </div>
                                )}
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
                                        <button className="confirmation-btn cancel" onClick={cancelDelete} disabled={isDeleting}>
                                            Cancel
                                        </button>
                                        <button
                                            className="confirmation-btn delete"
                                            onClick={confirmDelete}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? (
                                                <span
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        gap: "8px"
                                                    }}
                                                >
                                                    <span className="btn-loader"></span>
                                                    <span>Deleting...</span>
                                                </span>
                                            ) : (
                                                "Delete"
                                            )}
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