# Quick Start Guide

## Installation

```bash
npm install flipbook-react
# or
yarn add flipbook-react
# or
pnpm add flipbook-react
```

## Minimal Example

```jsx
import React from 'react';
import Flipbook from 'flipbook-react';

function App() {
  const pages = [
    'page1.jpg',
    'page2.jpg',
    'page3.jpg'
  ];

  return (
    <div style={{ width: '90vw', height: '90vh' }}>
      <Flipbook pages={pages} />
    </div>
  );
}

export default App;
```

## Example with Controls

```jsx
import React, { useState } from 'react';
import Flipbook from 'flipbook-react';

function App() {
  const [pages] = useState([
    'page1.jpg',
    'page2.jpg',
    'page3.jpg',
    'page4.jpg'
  ]);

  return (
    <div style={{ width: '90vw', height: '90vh' }}>
      <Flipbook pages={pages}>
        {(flipbook) => (
          <div style={{ 
            position: 'absolute', 
            top: 10, 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: 10,
            background: 'rgba(0,0,0,0.7)',
            padding: '10px',
            borderRadius: '8px'
          }}>
            <button 
              onClick={flipbook.flipLeft} 
              disabled={!flipbook.canFlipLeft}
            >
              ◄
            </button>
            
            <span style={{ color: 'white', margin: '0 10px' }}>
              Page {flipbook.page} of {flipbook.numPages}
            </span>
            
            <button 
              onClick={flipbook.flipRight} 
              disabled={!flipbook.canFlipRight}
            >
              ►
            </button>
          </div>
        )}
      </Flipbook>
    </div>
  );
}

export default App;
```

## Example with Events

```jsx
import React, { useState } from 'react';
import Flipbook from 'flipbook-react';

function App() {
  const [pages] = useState(['page1.jpg', 'page2.jpg', 'page3.jpg']);
  const [currentPage, setCurrentPage] = useState(1);

  const handleFlipEnd = (page) => {
    setCurrentPage(page);
    console.log('Now on page:', page);
  };

  return (
    <div style={{ width: '90vw', height: '90vh' }}>
      <h2>Current Page: {currentPage}</h2>
      <Flipbook
        pages={pages}
        onFlipLeftEnd={handleFlipEnd}
        onFlipRightEnd={handleFlipEnd}
      />
    </div>
  );
}

export default App;
```

## Example with Custom Options

```jsx
import React, { useState } from 'react';
import Flipbook from 'flipbook-react';

function App() {
  const [pages] = useState(['page1.jpg', 'page2.jpg', 'page3.jpg']);

  return (
    <div style={{ width: '90vw', height: '90vh' }}>
      <Flipbook
        pages={pages}
        flipDuration={1500}
        zoomDuration={700}
        zooms={[1, 2, 3, 5]}
        singlePage={false}
        forwardDirection="right"
        centering={true}
        startPage={1}
        clickToZoom={true}
        dragToFlip={true}
      />
    </div>
  );
}

export default App;
```

## TypeScript Example

```tsx
import React, { useState } from 'react';
import Flipbook, { FlipbookRenderProps } from 'flipbook-react';

const App: React.FC = () => {
  const [pages] = useState<string[]>([
    'page1.jpg',
    'page2.jpg',
    'page3.jpg'
  ]);

  const handleFlipEnd = (page: number): void => {
    console.log('Page:', page);
  };

  return (
    <div style={{ width: '90vw', height: '90vh' }}>
      <Flipbook
        pages={pages}
        onFlipRightEnd={handleFlipEnd}
      >
        {(flipbook: FlipbookRenderProps) => (
          <button onClick={flipbook.flipRight}>
            Next ({flipbook.page}/{flipbook.numPages})
          </button>
        )}
      </Flipbook>
    </div>
  );
};

export default App;
```

## Common Patterns

### Keyboard Navigation

```jsx
import React, { useEffect, useRef } from 'react';
import Flipbook from 'flipbook-react';

function App() {
  const flipbookRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!flipbookRef.current) return;
      
      if (e.key === 'ArrowLeft' && flipbookRef.current.canFlipLeft) {
        flipbookRef.current.flipLeft();
      }
      if (e.key === 'ArrowRight' && flipbookRef.current.canFlipRight) {
        flipbookRef.current.flipRight();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{ width: '90vw', height: '90vh' }}>
      <Flipbook pages={pages}>
        {(flipbook) => {
          flipbookRef.current = flipbook;
          return <YourControls />;
        }}
      </Flipbook>
    </div>
  );
}
```

### URL-based Page Navigation

```jsx
import React, { useState, useEffect } from 'react';
import Flipbook from 'flipbook-react';

function App() {
  const [pages] = useState(['page1.jpg', 'page2.jpg', 'page3.jpg']);
  const [startPage, setStartPage] = useState(1);

  useEffect(() => {
    // Read page from URL hash
    const hash = window.location.hash.slice(1);
    const pageNum = parseInt(hash, 10);
    if (pageNum > 0) {
      setStartPage(pageNum);
    }
  }, []);

  const handleFlipEnd = (page) => {
    // Update URL hash
    window.location.hash = `#${page}`;
  };

  return (
    <div style={{ width: '90vw', height: '90vh' }}>
      <Flipbook
        pages={pages}
        startPage={startPage}
        onFlipLeftEnd={handleFlipEnd}
        onFlipRightEnd={handleFlipEnd}
      />
    </div>
  );
}
```

## Tips

1. **Container Size**: Always set explicit width and height on the container
2. **Image Aspect Ratio**: Use images with the same aspect ratio for best results
3. **Performance**: Use optimized images, especially for hi-res versions
4. **Mobile**: The component automatically switches to single-page mode on mobile
5. **Loading**: Provide a custom loading image for better UX

## Next Steps

- Check out the [full README](./README.md) for all available props
- See the [migration guide](./MIGRATION.md) if coming from Vue
- Review the [example app](./example/App.js) for a complete implementation
