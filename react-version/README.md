# flipbook-react

A React component that displays images in 3D page flip effect.

This is a React (v18+) conversion of the original [flipbook-vue](https://github.com/ts1/flipbook-vue) component.

## Installation

Install as a module:

```bash
npm install flipbook-react
```

or

```bash
yarn add flipbook-react
```

or

```bash
pnpm add flipbook-react
```

## Usage

```jsx
import React from 'react';
import Flipbook from 'flipbook-react';

function App() {
  const pages = [
    'image1.jpg',
    'image2.jpg',
    'image3.jpg',
    // ... more image URLs
  ];

  return (
    <div style={{ width: '90vw', height: '90vh' }}>
      <Flipbook pages={pages} />
    </div>
  );
}

export default App;
```

## Props

### `pages` (required)

Array of image URLs. All images should have the same aspect ratio.

If the first element is `null`, the next element is displayed alone (as the cover page).

### `pagesHiRes`

Array of high resolution versions of image URLs. They are used when zoomed.

### `flipDuration`

Duration of page flipping animation in milliseconds. Defaults to `1000`.

### `zoomDuration`

Duration of zoom in/out animation in milliseconds. Defaults to `500`.

### `zooms`

Array of possible magnifications. `null` is equivalent to `[1]` (no zoom). Defaults to `[1, 2, 4]`. 

**NOTE**: Do **NOT** pass an empty array.

### `ambient`

Intensity of ambient light in 0 to 1. Smaller value gives more shades. Defaults to `0.4`.

### `gloss`

Intensity of specular light in 0 to 1. Higher value gives more gloss. Defaults to `0.6`.

### `perspective`

Z-axis distance in pixels between the screen and the viewer. Higher value gives less effect. Defaults to `2400`.

### `nPolygons`

How many rectangles a single page is horizontally split into. Higher value gives higher quality rendering in exchange for performance. Defaults to `10`.

### `singlePage`

Force single page mode regardless of viewport size. Defaults to `false`.

### `forwardDirection`

Reading direction. If your document is right-to-left, set this to `"left"`. Default is `"right"`.

### `centering`

Enable centering of the cover pages. Default is `true`.

### `startPage`

Page number (>= 1) to open. Default is `null`.

### `loadingImage`

URL of an image that is displayed while page is loading. By default, an internal animated SVG is used.

### `clickToZoom`

Zoom in or out on click or tap. Default is `true`.

### `dragToFlip`

Flip page by dragging/swiping. Default is `true`.

### `wheel`

When set to `'zoom'`, mouse wheel events zoom in/out the page. Default is `'scroll'`, wheel events and touch pad scroll gestures scroll the zoomed page.

## Events (Callbacks)

### `onFlipLeftStart`

Callback fired when flip to left animation starts. Receives page number before flip as argument.

```jsx
<Flipbook pages={pages} onFlipLeftStart={(page) => console.log('Flipping left from page', page)} />
```

### `onFlipLeftEnd`

Callback fired when flip to left animation ends. Receives page number after flip as argument.

### `onFlipRightStart`

Callback fired when flip to right animation starts. Receives page number before flip as argument.

### `onFlipRightEnd`

Callback fired when flip to right animation ends. Receives page number after flip as argument.

### `onZoomStart`

Callback fired when zoom-in/out animation starts. Receives magnification after zoom as argument.

### `onZoomEnd`

Callback fired when zoom-in/out animation ends. Receives magnification after zoom as argument.

## Render Props

This component exposes some properties and methods through a render prop pattern. Pass a function as children:

```jsx
<Flipbook pages={pages}>
  {(flipbook) => (
    <div>
      <button onClick={flipbook.flipLeft} disabled={!flipbook.canFlipLeft}>
        Previous Page
      </button>
      <span>
        Page {flipbook.page} of {flipbook.numPages}
      </span>
      <button onClick={flipbook.flipRight} disabled={!flipbook.canFlipRight}>
        Next Page
      </button>
      <button onClick={flipbook.zoomIn} disabled={!flipbook.canZoomIn}>
        Zoom In
      </button>
      <button onClick={flipbook.zoomOut} disabled={!flipbook.canZoomOut}>
        Zoom Out
      </button>
    </div>
  )}
</Flipbook>
```

### Available properties and methods:

- `canFlipLeft`: Boolean - True if it can flip to previous page
- `canFlipRight`: Boolean - True if it can flip to next page
- `canZoomIn`: Boolean - True if it can zoom in
- `canZoomOut`: Boolean - True if it can zoom out
- `page`: Number - Current page number (1 to `numPages`)
- `numPages`: Number - Total number of pages
- `flipLeft()`: Function - Method to flip to previous page
- `flipRight()`: Function - Method to flip to next page
- `zoomIn()`: Function - Method to zoom in
- `zoomOut()`: Function - Method to zoom out

## Styling

You need to specify the size of the component container in your CSS. The component will adapt to the container size.

If the container is horizontally long, it displays two pages spread (suitable for desktop). If it's vertically long, it displays single pages (suitable for mobile).

```css
.flipbook-container {
  width: 90vw;
  height: 90vh;
}
```

### Internal CSS Classes

The component uses these internal classes that you can style:

- `.viewport` - A div element that contains everything
- `.bounding-box` - Approximate bounding box of the displayed images (suitable for box-shadow)
- `.page` - Individual page images
- `.polygon` - 3D transformation polygons
- `.lighting` - Lighting effects on pages

## Browser Support

Supports modern browsers. The component uses ES6+ features and React 18+.

## Differences from Vue Version

This React version maintains the same functionality as the original Vue component but uses React patterns:

- Vue `$emit` events → React callback props (e.g., `onFlipLeftStart`)
- Vue slot props → React render props (children as function)
- Vue `$refs` → Exposed methods through render props
- Vue watchers → React useEffect hooks
- Vue computed → React useMemo hooks

## Example

Complete example with controls:

```jsx
import React, { useState } from 'react';
import Flipbook from 'flipbook-react';

function FlipbookDemo() {
  const [pages] = useState([
    'https://example.com/page1.jpg',
    'https://example.com/page2.jpg',
    'https://example.com/page3.jpg',
    'https://example.com/page4.jpg',
  ]);

  const handleFlipEnd = (page) => {
    console.log('Now on page:', page);
  };

  return (
    <div style={{ width: '90vw', height: '90vh' }}>
      <Flipbook
        pages={pages}
        onFlipLeftEnd={handleFlipEnd}
        onFlipRightEnd={handleFlipEnd}
      >
        {({ canFlipLeft, canFlipRight, canZoomIn, canZoomOut, page, numPages, flipLeft, flipRight, zoomIn, zoomOut }) => (
          <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
            <button onClick={flipLeft} disabled={!canFlipLeft}>◄</button>
            <button onClick={zoomIn} disabled={!canZoomIn}>+</button>
            <span style={{ margin: '0 10px' }}>Page {page} of {numPages}</span>
            <button onClick={zoomOut} disabled={!canZoomOut}>-</button>
            <button onClick={flipRight} disabled={!canFlipRight}>►</button>
          </div>
        )}
      </Flipbook>
    </div>
  );
}

export default FlipbookDemo;
```

## Credits

- Original Vue component: [flipbook-vue](https://github.com/ts1/flipbook-vue) by Takeshi Sone
- React conversion: Based on flipbook-vue 1.0.0-beta.4

## License

MIT

Copyright © 2024. Converted from flipbook-vue by Takeshi Sone.
