import { ReactNode } from 'react';

export interface FlipbookRenderProps {
  canFlipLeft: boolean;
  canFlipRight: boolean;
  canZoomIn: boolean;
  canZoomOut: boolean;
  page: number;
  numPages: number;
  flipLeft: () => void;
  flipRight: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export interface FlipbookProps {
  /** Array of image URLs. Required. All images should have the same aspect ratio. */
  pages: string[];
  
  /** Array of high resolution versions of image URLs. They are used when zoomed. */
  pagesHiRes?: string[];
  
  /** Duration of page flipping animation in milliseconds. Default: 1000 */
  flipDuration?: number;
  
  /** Duration of zoom in/out animation in milliseconds. Default: 500 */
  zoomDuration?: number;
  
  /** Array of possible magnifications. Default: [1, 2, 4] */
  zooms?: number[];
  
  /** Z-axis distance in pixels between the screen and the viewer. Default: 2400 */
  perspective?: number;
  
  /** How many rectangles a single page is horizontally split into. Default: 10 */
  nPolygons?: number;
  
  /** Intensity of ambient light in 0 to 1. Default: 0.4 */
  ambient?: number;
  
  /** Intensity of specular light in 0 to 1. Default: 0.6 */
  gloss?: number;
  
  /** Minimum swipe distance. Default: 3 */
  swipeMin?: number;
  
  /** Force single page mode regardless of viewport size. Default: false */
  singlePage?: boolean;
  
  /** Reading direction. Default: 'right' */
  forwardDirection?: 'right' | 'left';
  
  /** Enable centering of the cover pages. Default: true */
  centering?: boolean;
  
  /** Page number (>= 1) to open. Default: null */
  startPage?: number | null;
  
  /** URL of an image that is displayed while page is loading. */
  loadingImage?: string;
  
  /** Zoom in or out on click or tap. Default: true */
  clickToZoom?: boolean;
  
  /** Flip page by dragging/swiping. Default: true */
  dragToFlip?: boolean;
  
  /** Mouse wheel behavior. Default: 'scroll' */
  wheel?: 'scroll' | 'zoom';
  
  /** Callback fired when flip to left animation starts. */
  onFlipLeftStart?: (page: number) => void;
  
  /** Callback fired when flip to left animation ends. */
  onFlipLeftEnd?: (page: number) => void;
  
  /** Callback fired when flip to right animation starts. */
  onFlipRightStart?: (page: number) => void;
  
  /** Callback fired when flip to right animation ends. */
  onFlipRightEnd?: (page: number) => void;
  
  /** Callback fired when zoom-in/out animation starts. */
  onZoomStart?: (zoom: number) => void;
  
  /** Callback fired when zoom-in/out animation ends. */
  onZoomEnd?: (zoom: number) => void;
  
  /** Render prop function or regular children */
  children?: ((props: FlipbookRenderProps) => ReactNode) | ReactNode;
}

declare const Flipbook: React.FC<FlipbookProps>;

export default Flipbook;
