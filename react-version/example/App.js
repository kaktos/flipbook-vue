import React, { useState } from 'react';
import Flipbook from '../src/index';

function App() {
  // Example image URLs (you can replace these with actual images)
  const [pages] = useState([
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=1200',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=1200',
    'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&h=1200',
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=1200',
    'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=1200',
  ]);

  const handleFlipLeftEnd = (page) => {
    console.log('Flipped left to page:', page);
  };

  const handleFlipRightEnd = (page) => {
    console.log('Flipped right to page:', page);
  };

  const handleZoomStart = (zoom) => {
    console.log('Zoom started:', zoom);
  };

  const handleZoomEnd = (zoom) => {
    console.log('Zoom ended:', zoom);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        background: '#333', 
        color: 'white' 
      }}>
        <h1>Flipbook React Demo</h1>
        <p>Click on the sides to flip pages, or use the controls below</p>
      </div>
      
      <div style={{ flex: 1, position: 'relative' }}>
        <Flipbook
          pages={pages}
          onFlipLeftEnd={handleFlipLeftEnd}
          onFlipRightEnd={handleFlipRightEnd}
          onZoomStart={handleZoomStart}
          onZoomEnd={handleZoomEnd}
        >
          {({ 
            canFlipLeft, 
            canFlipRight, 
            canZoomIn, 
            canZoomOut, 
            page, 
            numPages, 
            flipLeft, 
            flipRight, 
            zoomIn, 
            zoomOut 
          }) => (
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              background: 'rgba(0, 0, 0, 0.7)',
              padding: '10px 20px',
              borderRadius: '8px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}>
              <button
                onClick={flipLeft}
                disabled={!canFlipLeft}
                style={{
                  padding: '8px 16px',
                  fontSize: '18px',
                  cursor: canFlipLeft ? 'pointer' : 'not-allowed',
                  opacity: canFlipLeft ? 1 : 0.5,
                  border: 'none',
                  borderRadius: '4px',
                  background: '#4CAF50',
                  color: 'white'
                }}
              >
                ◄ Previous
              </button>
              
              <button
                onClick={zoomIn}
                disabled={!canZoomIn}
                style={{
                  padding: '8px 16px',
                  fontSize: '18px',
                  cursor: canZoomIn ? 'pointer' : 'not-allowed',
                  opacity: canZoomIn ? 1 : 0.5,
                  border: 'none',
                  borderRadius: '4px',
                  background: '#2196F3',
                  color: 'white'
                }}
              >
                +
              </button>
              
              <span style={{ 
                color: 'white', 
                fontSize: '16px', 
                fontWeight: 'bold',
                minWidth: '120px',
                textAlign: 'center'
              }}>
                Page {page} of {numPages}
              </span>
              
              <button
                onClick={zoomOut}
                disabled={!canZoomOut}
                style={{
                  padding: '8px 16px',
                  fontSize: '18px',
                  cursor: canZoomOut ? 'pointer' : 'not-allowed',
                  opacity: canZoomOut ? 1 : 0.5,
                  border: 'none',
                  borderRadius: '4px',
                  background: '#2196F3',
                  color: 'white'
                }}
              >
                -
              </button>
              
              <button
                onClick={flipRight}
                disabled={!canFlipRight}
                style={{
                  padding: '8px 16px',
                  fontSize: '18px',
                  cursor: canFlipRight ? 'pointer' : 'not-allowed',
                  opacity: canFlipRight ? 1 : 0.5,
                  border: 'none',
                  borderRadius: '4px',
                  background: '#4CAF50',
                  color: 'white'
                }}
              >
                Next ►
              </button>
            </div>
          )}
        </Flipbook>
      </div>
    </div>
  );
}

export default App;
