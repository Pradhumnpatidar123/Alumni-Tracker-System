import React, { useEffect, useState } from "react";
import { API_ALUMNI_URL } from "../../utils";

const GalleryList = () => {
    const [galleryData, setGalleryData] = useState([])
    const [error, setError]=useState('')
    const [selectedImage, setSelectedImage] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [downloadingEvent, setDownloadingEvent] = useState(null)

    // Handle image click to open modal
    const handleImageClick = (imageSrc, eventName) => {
        setSelectedImage({ src: imageSrc, eventName });
        setIsModalOpen(true);
    };

    // Handle modal close
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedImage(null);
    };

    // Handle single image download
    const handleDownload = async () => {
        if (!selectedImage) return;
        
        try {
            const response = await fetch(selectedImage.src);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${selectedImage.eventName}_${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading image:', error);
            alert('Failed to download image');
        }
    };

    // Handle download all images for an event
    const handleDownloadAllImages = async (eventData) => {
        if (!eventData.images || eventData.images.length === 0) {
            alert('No images available for download');
            return;
        }

        setDownloadingEvent(eventData.eventName);
        
        try {
            // Create a promise for each image download
            const downloadPromises = eventData.images.map(async (img, index) => {
                try {
                    const response = await fetch(`/images/${img}`);
                    if (!response.ok) throw new Error(`Failed to fetch ${img}`);
                    
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${eventData.eventName}_image_${index + 1}_${Date.now()}.jpg`;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(url);
                    
                    // Add a small delay between downloads to prevent overwhelming the browser
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error) {
                    console.error(`Error downloading image ${img}:`, error);
                }
            });

            await Promise.all(downloadPromises);
            alert(`Successfully initiated download of ${eventData.images.length} images from ${eventData.eventName}`);
        } catch (error) {
            console.error('Error downloading images:', error);
            alert('Some images failed to download. Please try again.');
        } finally {
            setDownloadingEvent(null);
        }
    };

    // Handle keyboard events for modal
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (isModalOpen) {
                if (event.key === 'Escape') {
                    handleCloseModal();
                } else if (event.key === 'd' || event.key === 'D') {
                    handleDownload();
                }
            }
        };

        if (isModalOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen]);


  const message = "Welcome to the Gallery";
  useEffect(() => {
    const fetchGalleryData = async () => {
        try {
          console.log('Fetching gallery data...');
          const response = await fetch(API_ALUMNI_URL+'/alumniViewGallery', {
            method: 'GET',
            credentials: 'include', // include cookies
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          console.log('Full API response:', data);
          
          if (!response.ok) {
              console.error('API response not ok:', response.status, data.message);
              setError(data.message || 'Failed to fetch gallery data');
              setGalleryData([]);
              return;
          }
          
          // Clear any previous errors
          setError('');
          
          // Process gallery data - it should already have eventName from backend
          const processedData = (data.galleryData || []).map(item => ({
            ...item,
            eventName: item.eventName || 'Unknown Event',
            images: item.images || []
          }));
          
          console.log('Processed gallery data:', processedData);
          setGalleryData(processedData);
        } catch (error) {
          console.error('Error fetching gallery data:', error);
          setError('Network error: ' + error.message);
          setGalleryData([]);
        }
    }
    fetchGalleryData();
  },[])

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Gallery List</h3>
      <span style={styles.message}>{message}</span>
      {error && (
        <div style={{...styles.message, color: 'red', backgroundColor: '#fee', padding: '8px', borderRadius: '4px', border: '1px solid #fcc'}}>
          Error: {error}
        </div>
      )}

      {galleryData.length === 0 ? (
        <div style={styles.empty}>No Record Found</div>
      ) : (
        <>
          {/* Responsive table wrapper (scrolls on small screens) */}
          <div style={styles.tableWrap}>
            <table style={styles.table} role="table" aria-label="Gallery table">
              <thead style={styles.thead}>
                <tr>
                  <th style={styles.th}>S.no</th>
                  <th style={styles.th}>EventName</th>
                  <th style={styles.th}>Glimpses</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {galleryData.map((obj, index) => (
                  <tr key={obj.eventName + index}>
                    <td style={styles.td}>
                      <span style={styles.cellHeader}>S.no</span>
                      {index + 1}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.cellHeader}>EventName</span>
                      {obj.eventName}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.cellHeader}>Glimpses</span>
                      <div style={styles.thumbRow}>
                        {obj.images.map((img) => (
                          <img
                            key={img}
                            src={`/images/${img}`}
                            alt={`${obj.eventName} thumbnail`}
                            style={{...styles.thumb, cursor: 'pointer'}}
                            loading="lazy"
                            onClick={() => handleImageClick(`/images/${img}`, obj.eventName)}
                          />
                        ))}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.cellHeader}>Actions</span>
                      <button
                        style={{
                          ...styles.downloadAllBtn,
                          opacity: downloadingEvent === obj.eventName ? 0.6 : 1,
                          cursor: downloadingEvent === obj.eventName ? 'not-allowed' : 'pointer'
                        }}
                        onClick={() => handleDownloadAllImages(obj)}
                        disabled={downloadingEvent === obj.eventName}
                        title={`Download all ${obj.images.length} images from ${obj.eventName}`}
                      >
                        {downloadingEvent === obj.eventName ? (
                          <>🔄 Downloading...</>
                        ) : (
                          <>📦 Download All ({obj.images.length})</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile-first Grid (visible under 768px via CSS) */}
          <div style={styles.cardsWrap}>
            {galleryData.map((obj, index) => (
              <section key={obj.eventName + "-card"} style={styles.card}>
                <header style={styles.cardHeader}>
                  <div style={styles.cardTitleSection}>
                    <span style={styles.badge}>#{index + 1}</span>
                    <h4 style={styles.cardTitle}>{obj.eventName}</h4>
                  </div>
                  <button
                    style={{
                      ...styles.downloadAllBtnMobile,
                      opacity: downloadingEvent === obj.eventName ? 0.6 : 1,
                      cursor: downloadingEvent === obj.eventName ? 'not-allowed' : 'pointer'
                    }}
                    onClick={() => handleDownloadAllImages(obj)}
                    disabled={downloadingEvent === obj.eventName}
                    title={`Download all ${obj.images.length} images`}
                  >
                    {downloadingEvent === obj.eventName ? (
                      <>🔄</>
                    ) : (
                      <>📦 {obj.images.length}</>
                    )}
                  </button>
                </header>
                <div style={styles.grid}>
                  {obj.images.map((img) => (
                    <figure key={img} style={styles.figure}>
                      <img
                        src={`/images/${img}`}
                        alt={`${obj.eventName} glimpse`}
                        style={{...styles.gridImg, cursor: 'pointer'}}
                        loading="lazy"
                        onClick={() => handleImageClick(`/images/${img}`, obj.eventName)}
                      />
                    </figure>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}

      {/* Image Modal */}
      {isModalOpen && selectedImage && (
        <div style={styles.modalOverlay} onClick={handleCloseModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{selectedImage.eventName}</h3>
              <div style={styles.modalActions}>
                <button 
                  style={styles.downloadBtn}
                  onClick={handleDownload}
                  title="Download Image"
                >
                  📥 Download
                </button>
                <button 
                  style={styles.closeBtn}
                  onClick={handleCloseModal}
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>
            <div style={styles.modalImageContainer}>
              <img
                src={selectedImage.src}
                alt={`${selectedImage.eventName} full size`}
                style={styles.modalImage}
              />
            </div>
          </div>
        </div>
      )}

      {/* Inline responsive styles via a style tag for media queries */}
      <style>{responsiveCss}</style>
    </div>
  );
};

// Inline styles for layout and theming
const styles = {
  container: {
    padding: "16px",
    maxWidth: 1200,
    margin: "0 auto",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },
  title: { margin: "0 0 8px" },
  message: { display: "block", marginBottom: 16, color: "#444" },
  empty: { padding: 16, color: "#666" },

  tableWrap: {
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    background: "#fff",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
    minWidth: 480,
  },
  thead: { background: "#f8fafc" },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    borderBottom: "1px solid #e5e7eb",
    color: "#111827",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  td: {
    padding: "10px 12px",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "top",
    color: "#111827",
  },
  cellHeader: {
    display: "none", // shown via media query on small screens
    fontWeight: 600,
    marginRight: 8,
    color: "#6b7280",
  },
  thumbRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  thumb: {
    width: 100,
    height: 100,
    objectFit: "cover",
    borderRadius: 6,
    border: "1px solid #e5e7eb",
    background: "#f8fafc",
  },

  cardsWrap: {
    display: "none", // shown via media query on small screens
    marginTop: 16,
    gap: 16,
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 12,
    background: "#fff",
  },
  badge: {
    display: "inline-block",
    padding: "2px 8px",
    fontSize: 12,
    borderRadius: 999,
    background: "#eef2ff",
    color: "#3730a3",
    marginRight: 8,
  },
  cardHeader: { 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between",
    marginBottom: 8 
  },
  cardTitleSection: {
    display: "flex",
    alignItems: "center",
    flex: 1
  },
  cardTitle: { margin: 0, fontSize: 16 },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  figure: { margin: 0 },
  gridImg: {
    width: "calc(50% - 4px)", // 2 columns on very small screens
    maxWidth: "100%",
    aspectRatio: "1 / 1",
    objectFit: "cover",
    borderRadius: 6,
    border: "1px solid #e5e7eb",
    background: "#f8fafc",
  },

  // Modal styles
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 0,
    maxWidth: "90vw",
    maxHeight: "90vh",
    overflow: "hidden",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#f8fafc",
  },
  modalTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    color: "#111827",
  },
  modalActions: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  downloadBtn: {
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: 4,
    transition: "background-color 0.2s",
  },
  closeBtn: {
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 600,
    transition: "background-color 0.2s",
  },
  modalImageContainer: {
    padding: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  modalImage: {
    maxWidth: "100%",
    maxHeight: "70vh",
    objectFit: "contain",
    borderRadius: 8,
    boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)",
  },

  // Download All Button styles
  downloadAllBtn: {
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: 4,
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  },
  downloadAllBtnMobile: {
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: 2,
    transition: "all 0.2s",
    minWidth: "auto",
  },
};

// Media-query CSS string for behavior toggles
const responsiveCss = `
/* Enhance row striping and hover */
tbody tr:nth-child(even) { background-color: #fafafa; }
tbody tr:hover { background: #f5f5f5; }

/* Image hover effects */
img[style*="cursor: pointer"]:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease-in-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Button hover effects */
button[style*="downloadBtn"]:hover {
  background-color: #2563eb !important;
}

button[style*="closeBtn"]:hover {
  background-color: #dc2626 !important;
}

button[style*="downloadAllBtn"]:hover:not(:disabled) {
  background-color: #059669 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

button[style*="downloadAllBtnMobile"]:hover:not(:disabled) {
  background-color: #059669 !important;
  transform: translateY(-1px);
}

/* Modal animations */
div[style*="modalOverlay"] {
  animation: fadeIn 0.2s ease-out;
}

div[style*="modalContent"] {
  animation: slideIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Mobile adjustments */
@media (max-width: 768px) {
  /* Convert table rows into block-like rows with inline headers */
  thead { display: none; }
  td { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  td > img, td > div { width: 100%; }
  /* Show per-cell header labels for accessibility on small screens */
  span[style*="cellHeader"] { display: inline-block !important; }

  /* Show the card/grid view and hide the table shell (keep scroll option off mobile) */
  /* Keep table available as fallback if desired; here we prioritize card view */
  div[style*="tableWrap"] { display: none !important; }
  div[style*="cardsWrap"] { display: grid !important; grid-template-columns: 1fr; }
  
  /* Modal responsive adjustments */
  div[style*="modalContent"] {
    margin: 10px;
    max-width: calc(100vw - 20px) !important;
    max-height: calc(100vh - 20px) !important;
  }
  
  div[style*="modalHeader"] {
    padding: 12px 16px !important;
  }
  
  h3[style*="modalTitle"] {
    font-size: 16px !important;
  }
  
  button[style*="downloadAllBtn"] {
    padding: 6px 8px !important;
    font-size: 10px !important;
  }
  
  /* Hide the text on very small screens, show only icon and count */
  button[style*="downloadAllBtn"] {
    white-space: nowrap;
  }
}

/* Wider small screens: make grid 3 columns */
@media (min-width: 480px) and (max-width: 768px) {
  img[style*="gridImg"] { width: calc(33.333% - 6px) !important; }
}

/* Tablets and up: grid 4 columns when shown */
@media (min-width: 768px) {
  img[style*="gridImg"] { width: calc(25% - 6px) !important; }
}
`;

export default GalleryList;
