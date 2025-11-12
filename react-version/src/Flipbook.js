import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import Matrix from './Matrix';
import spinner from './spinner.svg';
import './Flipbook.css';

const easeIn = (x) => Math.pow(x, 2);
const easeOut = (x) => 1 - easeIn(1 - x);
const easeInOut = (x) => {
  if (x < 0.5) return easeIn(x * 2) / 2;
  else return 0.5 + easeOut((x - 0.5) * 2) / 2;
};

const Flipbook = ({
  pages,
  pagesHiRes = [],
  flipDuration = 1000,
  zoomDuration = 500,
  zooms = [1, 2, 4],
  perspective = 2400,
  nPolygons = 10,
  ambient = 0.4,
  gloss = 0.6,
  swipeMin = 3,
  singlePage = false,
  forwardDirection = 'right',
  centering = true,
  startPage = null,
  loadingImage = spinner,
  clickToZoom = true,
  dragToFlip = true,
  wheel = 'scroll',
  onFlipLeftStart,
  onFlipLeftEnd,
  onFlipRightStart,
  onFlipRightEnd,
  onZoomStart,
  onZoomEnd,
  children
}) => {
  // State management
  const [viewWidth, setViewWidth] = useState(0);
  const [viewHeight, setViewHeight] = useState(0);
  const [imageWidth, setImageWidth] = useState(null);
  const [imageHeight, setImageHeight] = useState(null);
  const [displayedPages, setDisplayedPages] = useState(1);
  const [nImageLoad, setNImageLoad] = useState(0);
  const [nImageLoadTrigger, setNImageLoadTrigger] = useState(0);
  const [imageLoadCallback, setImageLoadCallback] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [firstPage, setFirstPage] = useState(0);
  const [secondPage, setSecondPage] = useState(1);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [zooming, setZooming] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [maxMove, setMaxMove] = useState(0);
  const [activeCursor, setActiveCursor] = useState(null);
  const [hasTouchEvents, setHasTouchEvents] = useState(false);
  const [hasPointerEvents, setHasPointerEvents] = useState(false);
  const [minX, setMinX] = useState(Infinity);
  const [maxX, setMaxX] = useState(-Infinity);
  const [preloadedImages, setPreloadedImages] = useState({});
  const [flip, setFlip] = useState({
    progress: 0,
    direction: null,
    frontImage: null,
    backImage: null,
    auto: false,
    opacity: 1
  });
  const [currentCenterOffset, setCurrentCenterOffset] = useState(null);
  const [animatingCenter, setAnimatingCenter] = useState(false);
  const [startScrollLeft, setStartScrollLeft] = useState(0);
  const [startScrollTop, setStartScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});

  // Refs
  const viewportRef = useRef(null);
  const flipAnimationRef = useRef(null);
  const zoomAnimationRef = useRef(null);
  const centerAnimationRef = useRef(null);

  // Browser detection
  const IE = useMemo(() => {
    return typeof navigator !== 'undefined' && /Trident/.test(navigator.userAgent);
  }, []);

  // Computed values
  const zooms_ = useMemo(() => zooms || [1], [zooms]);

  const numPages = useMemo(() => {
    if (pages[0] === null) return pages.length - 1;
    return pages.length;
  }, [pages]);

  const page = useMemo(() => {
    if (pages[0] !== null) {
      return currentPage + 1;
    } else {
      return Math.max(1, currentPage);
    }
  }, [currentPage, pages]);

  const canGoForward = useMemo(() => {
    return !flip.direction && currentPage < pages.length - displayedPages;
  }, [flip.direction, currentPage, pages.length, displayedPages]);

  const canGoBack = useMemo(() => {
    return !flip.direction && currentPage >= displayedPages &&
      !(displayedPages === 1 && !pageUrl(firstPage - 1));
  }, [flip.direction, currentPage, displayedPages, firstPage]);

  const canFlipLeft = useMemo(() => {
    if (forwardDirection === 'left') return canGoForward;
    return canGoBack;
  }, [forwardDirection, canGoForward, canGoBack]);

  const canFlipRight = useMemo(() => {
    if (forwardDirection === 'right') return canGoForward;
    return canGoBack;
  }, [forwardDirection, canGoForward, canGoBack]);

  const canZoomIn = useMemo(() => {
    return !zooming && zoomIndex < zooms_.length - 1;
  }, [zooming, zoomIndex, zooms_.length]);

  const canZoomOut = useMemo(() => {
    return !zooming && zoomIndex > 0;
  }, [zooming, zoomIndex]);

  const leftPage = useMemo(() => {
    if (forwardDirection === 'right' || displayedPages === 1) {
      return firstPage;
    } else {
      return secondPage;
    }
  }, [forwardDirection, displayedPages, firstPage, secondPage]);

  const rightPage = useMemo(() => {
    if (forwardDirection === 'left') return firstPage;
    return secondPage;
  }, [forwardDirection, firstPage, secondPage]);

  const pageUrl = useCallback((page, hiRes = false) => {
    if (hiRes && zoom > 1 && !zooming) {
      const url = pagesHiRes[page];
      if (url) return url;
    }
    return pages[page] || null;
  }, [pages, pagesHiRes, zoom, zooming]);

  const showLeftPage = useMemo(() => {
    return pageUrl(leftPage);
  }, [leftPage, pageUrl]);

  const showRightPage = useMemo(() => {
    return pageUrl(rightPage) && displayedPages === 2;
  }, [rightPage, displayedPages, pageUrl]);

  const cursor = useMemo(() => {
    if (activeCursor) {
      return activeCursor;
    } else if (IE) {
      return 'auto';
    } else if (clickToZoom && canZoomIn) {
      return 'zoom-in';
    } else if (clickToZoom && canZoomOut) {
      return 'zoom-out';
    } else if (dragToFlip) {
      return 'grab';
    } else {
      return 'auto';
    }
  }, [activeCursor, IE, clickToZoom, canZoomIn, canZoomOut, dragToFlip]);

  const pageScale = useMemo(() => {
    if (!imageWidth || !imageHeight) return 1;
    const vw = viewWidth / displayedPages;
    const xScale = vw / imageWidth;
    const yScale = viewHeight / imageHeight;
    const scale = xScale < yScale ? xScale : yScale;
    return scale < 1 ? scale : 1;
  }, [viewWidth, viewHeight, imageWidth, imageHeight, displayedPages]);

  const pageWidth = useMemo(() => {
    if (!imageWidth) return 0;
    return Math.round(imageWidth * pageScale);
  }, [imageWidth, pageScale]);

  const pageHeight = useMemo(() => {
    if (!imageHeight) return 0;
    return Math.round(imageHeight * pageScale);
  }, [imageHeight, pageScale]);

  const xMargin = useMemo(() => {
    return (viewWidth - pageWidth * displayedPages) / 2;
  }, [viewWidth, pageWidth, displayedPages]);

  const yMargin = useMemo(() => {
    return (viewHeight - pageHeight) / 2;
  }, [viewHeight, pageHeight]);

  const polygonWidth = useMemo(() => {
    const w = pageWidth / nPolygons;
    const wCeil = Math.ceil(w + 1 / zoom);
    return wCeil + 'px';
  }, [pageWidth, nPolygons, zoom]);

  const polygonHeight = useMemo(() => {
    return pageHeight + 'px';
  }, [pageHeight]);

  const polygonBgSize = useMemo(() => {
    return `${pageWidth}px ${pageHeight}px`;
  }, [pageWidth, pageHeight]);

  const boundingLeft = useMemo(() => {
    if (displayedPages === 1) {
      return xMargin;
    } else {
      const x = pageUrl(leftPage) ? xMargin : viewWidth / 2;
      return x < minX ? x : minX;
    }
  }, [displayedPages, xMargin, leftPage, viewWidth, minX, pageUrl]);

  const boundingRight = useMemo(() => {
    if (displayedPages === 1) {
      return viewWidth - xMargin;
    } else {
      const x = pageUrl(rightPage) ? viewWidth - xMargin : viewWidth / 2;
      return x > maxX ? x : maxX;
    }
  }, [displayedPages, viewWidth, xMargin, rightPage, maxX, pageUrl]);

  const centerOffset = useMemo(() => {
    const retval = centering
      ? Math.round(viewWidth / 2 - (boundingLeft + boundingRight) / 2)
      : 0;
    if (currentCenterOffset === null && imageWidth !== null) {
      setCurrentCenterOffset(retval);
    }
    return retval;
  }, [centering, viewWidth, boundingLeft, boundingRight, currentCenterOffset, imageWidth]);

  const centerOffsetSmoothed = useMemo(() => {
    return Math.round(currentCenterOffset || 0);
  }, [currentCenterOffset]);

  const dragToScroll = useMemo(() => {
    return !hasTouchEvents;
  }, [hasTouchEvents]);

  const scrollLeftMin = useMemo(() => {
    const w = (boundingRight - boundingLeft) * zoom;
    if (w < viewWidth) {
      return (boundingLeft + centerOffsetSmoothed) * zoom - (viewWidth - w) / 2;
    } else {
      return (boundingLeft + centerOffsetSmoothed) * zoom;
    }
  }, [boundingLeft, boundingRight, zoom, viewWidth, centerOffsetSmoothed]);

  const scrollLeftMax = useMemo(() => {
    const w = (boundingRight - boundingLeft) * zoom;
    if (w < viewWidth) {
      return (boundingLeft + centerOffsetSmoothed) * zoom - (viewWidth - w) / 2;
    } else {
      return (boundingRight + centerOffsetSmoothed) * zoom - viewWidth;
    }
  }, [boundingLeft, boundingRight, zoom, viewWidth, centerOffsetSmoothed]);

  const scrollTopMin = useMemo(() => {
    const h = pageHeight * zoom;
    if (h < viewHeight) {
      return yMargin * zoom - (viewHeight - h) / 2;
    } else {
      return yMargin * zoom;
    }
  }, [pageHeight, zoom, viewHeight, yMargin]);

  const scrollTopMax = useMemo(() => {
    const h = pageHeight * zoom;
    if (h < viewHeight) {
      return yMargin * zoom - (viewHeight - h) / 2;
    } else {
      return (yMargin + pageHeight) * zoom - viewHeight;
    }
  }, [pageHeight, zoom, viewHeight, yMargin]);

  const scrollLeftLimited = useMemo(() => {
    return Math.min(scrollLeftMax, Math.max(scrollLeftMin, scrollLeft));
  }, [scrollLeftMax, scrollLeftMin, scrollLeft]);

  const scrollTopLimited = useMemo(() => {
    return Math.min(scrollTopMax, Math.max(scrollTopMin, scrollTop));
  }, [scrollTopMax, scrollTopMin, scrollTop]);

  // Helper functions
  const loadImage = useCallback((url) => {
    if (imageWidth === null) {
      // First loaded image defines the image width and height.
      // So it must be true image, not 'loading' image.
      return url;
    } else {
      if (loadedImages[url]) {
        return url;
      } else {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => ({ ...prev, [url]: true }));
        };
        img.src = url;
        return loadingImage;
      }
    }
  }, [imageWidth, loadedImages, loadingImage]);

  const pageUrlLoading = useCallback((page, hiRes = false) => {
    const url = pageUrl(page, hiRes);
    // High-res image doesn't use 'loading'
    if (hiRes && zoom > 1 && !zooming) return url;
    return url && loadImage(url);
  }, [pageUrl, zoom, zooming, loadImage]);

  const computeLighting = useCallback((rot, dRotate) => {
    const gradients = [];
    const lightingPoints = [-0.5, -0.25, 0, 0.25, 0.5];
    
    if (ambient < 1) {
      const blackness = 1 - ambient;
      const diffuse = lightingPoints.map((d) => {
        return (1 - Math.cos((rot - dRotate * d) / 180 * Math.PI)) * blackness;
      });
      gradients.push(`
        linear-gradient(to right,
          rgba(0, 0, 0, ${diffuse[0]}),
          rgba(0, 0, 0, ${diffuse[1]}) 25%,
          rgba(0, 0, 0, ${diffuse[2]}) 50%,
          rgba(0, 0, 0, ${diffuse[3]}) 75%,
          rgba(0, 0, 0, ${diffuse[4]}))
      `);
    }

    if (gloss > 0 && !IE) {
      const DEG = 30;
      const POW = 200;
      const specular = lightingPoints.map((d) => {
        return Math.max(
          Math.pow(Math.cos((rot + DEG - dRotate * d) / 180 * Math.PI), POW),
          Math.pow(Math.cos((rot - DEG - dRotate * d) / 180 * Math.PI), POW)
        );
      });
      gradients.push(`
        linear-gradient(to right,
          rgba(255, 255, 255, ${specular[0] * gloss}),
          rgba(255, 255, 255, ${specular[1] * gloss}) 25%,
          rgba(255, 255, 255, ${specular[2] * gloss}) 50%,
          rgba(255, 255, 255, ${specular[3] * gloss}) 75%,
          rgba(255, 255, 255, ${specular[4] * gloss}))
      `);
    }
    
    return gradients.join(',');
  }, [ambient, gloss, IE]);

  const makePolygonArray = useCallback((face) => {
    if (!flip.direction) return [];

    let progress = flip.progress;
    let direction = flip.direction;

    if (displayedPages === 1 && direction !== forwardDirection) {
      progress = 1 - progress;
      direction = forwardDirection;
    }

    const newOpacity = (displayedPages === 1 && progress > 0.7)
      ? 1 - (progress - 0.7) / 0.3
      : 1;
    
    if (flip.opacity !== newOpacity) {
      setFlip(prev => ({ ...prev, opacity: newOpacity }));
    }

    const image = face === 'front' ? flip.frontImage : flip.backImage;
    const polygonWidth = pageWidth / nPolygons;

    let pageX = xMargin;
    let originRight = false;

    if (displayedPages === 1) {
      if (forwardDirection === 'right') {
        if (face === 'back') {
          originRight = true;
          pageX = xMargin - pageWidth;
        }
      } else {
        if (direction === 'left') {
          if (face === 'back') {
            pageX = pageWidth - xMargin;
          } else {
            originRight = true;
          }
        } else {
          if (face === 'front') {
            pageX = pageWidth - xMargin;
          } else {
            originRight = true;
          }
        }
      }
    } else {
      if (direction === 'left') {
        if (face === 'back') {
          pageX = viewWidth / 2;
        } else {
          originRight = true;
        }
      } else {
        if (face === 'front') {
          pageX = viewWidth / 2;
        } else {
          originRight = true;
        }
      }
    }

    const pageMatrix = new Matrix();
    pageMatrix.translate(viewWidth / 2);
    pageMatrix.perspective(perspective);
    pageMatrix.translate(-viewWidth / 2);
    pageMatrix.translate(pageX, yMargin);

    let pageRotation = 0;
    if (progress > 0.5) {
      pageRotation = -(progress - 0.5) * 2 * 180;
    }
    if (direction === 'left') {
      pageRotation = -pageRotation;
    }
    if (face === 'back') {
      pageRotation += 180;
    }

    if (pageRotation) {
      if (originRight) pageMatrix.translate(pageWidth);
      pageMatrix.rotateY(pageRotation);
      if (originRight) pageMatrix.translate(-pageWidth);
    }

    let theta;
    if (progress < 0.5) {
      theta = progress * 2 * Math.PI;
    } else {
      theta = (1 - (progress - 0.5) * 2) * Math.PI;
    }
    if (theta === 0) {
      theta = 1e-9;
    }
    const radius = pageWidth / theta;

    let radian = 0;
    const dRadian = theta / nPolygons;
    let rotate = dRadian / 2 / Math.PI * 180;
    const dRotate = dRadian / Math.PI * 180;

    if (originRight) {
      rotate = -theta / Math.PI * 180 + dRotate / 2;
    }

    if (face === 'back') {
      rotate = -rotate;
    }

    let newMinX = Infinity;
    let newMaxX = -Infinity;
    const result = [];

    for (let i = 0; i < nPolygons; i++) {
      const bgPos = `${i / (nPolygons - 1) * 100}% 0px`;

      const m = pageMatrix.clone();
      const rad = originRight ? theta - radian : radian;
      let x = Math.sin(rad) * radius;
      if (originRight) x = pageWidth - x;
      let z = (1 - Math.cos(rad)) * radius;
      if (face === 'back') z = -z;

      m.translate3d(x, 0, z);
      m.rotateY(-rotate);

      const x0 = m.transformX(0);
      const x1 = m.transformX(polygonWidth);
      newMaxX = Math.max(Math.max(x0, x1), newMaxX);
      newMinX = Math.min(Math.min(x0, x1), newMinX);

      const lighting = computeLighting(pageRotation - rotate, dRotate);

      radian += dRadian;
      rotate += dRotate;
      
      result.push([
        face + i,
        image,
        lighting,
        bgPos,
        m.toString(),
        Math.abs(Math.round(z))
      ]);
    }

    setMinX(newMinX);
    setMaxX(newMaxX);

    return result;
  }, [flip, displayedPages, forwardDirection, pageWidth, nPolygons, xMargin, viewWidth, yMargin, perspective, computeLighting]);

  const polygonArray = useMemo(() => {
    return makePolygonArray('front').concat(makePolygonArray('back'));
  }, [makePolygonArray]);

  // Event handlers and methods
  const onResize = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    
    setViewWidth(viewport.clientWidth);
    setViewHeight(viewport.clientHeight);
    
    const newDisplayedPages = (viewport.clientWidth > viewport.clientHeight && !singlePage) ? 2 : 1;
    setDisplayedPages(newDisplayedPages);
    
    setCurrentPage(prev => {
      let page = prev;
      if (newDisplayedPages === 2) {
        page = page & ~1;
      }
      return page;
    });
    
    setMinX(Infinity);
    setMaxX(-Infinity);
  }, [singlePage]);

  const fixFirstPage = useCallback(() => {
    setCurrentPage(prev => {
      if (displayedPages === 1 && prev === 0 && pages.length && !pageUrl(0)) {
        return prev + 1;
      }
      return prev;
    });
  }, [displayedPages, pages.length, pageUrl]);

  const didLoadImage = useCallback((ev) => {
    if (imageWidth === null) {
      const target = ev.target || ev.path[0];
      setImageWidth(target.naturalWidth);
      setImageHeight(target.naturalHeight);
      preloadImages();
    }
    
    if (imageLoadCallback) {
      setNImageLoad(prev => {
        const newCount = prev + 1;
        if (newCount >= nImageLoadTrigger) {
          imageLoadCallback();
          setImageLoadCallback(null);
        }
        return newCount;
      });
    }
  }, [imageWidth, imageLoadCallback, nImageLoadTrigger]);

  const onImageLoad = useCallback((trigger, cb) => {
    setNImageLoad(0);
    setNImageLoadTrigger(trigger);
    setImageLoadCallback(() => cb);
  }, []);

  const preloadImages = useCallback((hiRes = false) => {
    for (let i = currentPage - 3; i <= currentPage + 3; i++) {
      pageUrlLoading(i);
    }
    if (hiRes) {
      for (let i = currentPage; i < currentPage + displayedPages; i++) {
        const src = pagesHiRes[i];
        if (src) {
          const img = new Image();
          img.src = src;
        }
      }
    }
  }, [currentPage, displayedPages, pagesHiRes, pageUrlLoading]);

  const flipStart = useCallback((direction, auto) => {
    let frontImage, backImage;
    
    if (direction !== forwardDirection) {
      if (displayedPages === 1) {
        frontImage = pageUrl(currentPage - 1);
        backImage = null;
      } else {
        frontImage = pageUrl(firstPage);
        backImage = pageUrl(currentPage - displayedPages + 1);
      }
    } else {
      if (displayedPages === 1) {
        frontImage = pageUrl(currentPage);
        backImage = null;
      } else {
        frontImage = pageUrl(secondPage);
        backImage = pageUrl(currentPage + displayedPages);
      }
    }

    setFlip({
      direction,
      progress: 0,
      frontImage,
      backImage,
      auto: false,
      opacity: 1
    });

    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (direction !== forwardDirection) {
        if (displayedPages === 2) {
          setFirstPage(currentPage - displayedPages);
        }
      } else {
        if (displayedPages === 1) {
          setFirstPage(currentPage + displayedPages);
        } else {
          setSecondPage(currentPage + 1 + displayedPages);
        }
      }
      if (auto) flipAuto(true, direction);
    }));
  }, [forwardDirection, displayedPages, currentPage, firstPage, secondPage, pageUrl]);

  const flipAuto = useCallback((ease, direction) => {
    const t0 = Date.now();
    const startProgress = flip.progress;
    const duration = flipDuration * (1 - startProgress);
    
    setFlip(prev => ({ ...prev, auto: true }));
    
    if (direction === 'left' && onFlipLeftStart) {
      onFlipLeftStart(page);
    } else if (direction === 'right' && onFlipRightStart) {
      onFlipRightStart(page);
    }

    const animate = () => {
      flipAnimationRef.current = requestAnimationFrame(() => {
        const t = Date.now() - t0;
        let ratio = startProgress + t / duration;
        if (ratio > 1) ratio = 1;
        const progress = ease ? easeInOut(ratio) : ratio;
        
        setFlip(prev => ({ ...prev, progress }));

        if (ratio < 1) {
          animate();
        } else {
          setCurrentPage(prev => {
            if (direction !== forwardDirection) {
              return prev - displayedPages;
            } else {
              return prev + displayedPages;
            }
          });

          if (direction === 'left' && onFlipLeftEnd) {
            onFlipLeftEnd(page);
          } else if (direction === 'right' && onFlipRightEnd) {
            onFlipRightEnd(page);
          }

          if (displayedPages === 1 && direction === forwardDirection) {
            setFlip(prev => ({ ...prev, direction: null, auto: false }));
          } else {
            onImageLoad(1, () => {
              setFlip(prev => ({ ...prev, direction: null }));
            });
            setFlip(prev => ({ ...prev, auto: false }));
          }
        }
      });
    };
    
    animate();
  }, [flip.progress, flipDuration, page, displayedPages, forwardDirection, onFlipLeftStart, onFlipLeftEnd, onFlipRightStart, onFlipRightEnd, onImageLoad]);

  const flipRevert = useCallback(() => {
    const t0 = Date.now();
    const startProgress = flip.progress;
    const duration = flipDuration * startProgress;
    
    setFlip(prev => ({ ...prev, auto: true }));

    const animate = () => {
      flipAnimationRef.current = requestAnimationFrame(() => {
        const t = Date.now() - t0;
        let ratio = startProgress - startProgress * t / duration;
        if (ratio < 0) ratio = 0;
        
        setFlip(prev => ({ ...prev, progress: ratio }));

        if (ratio > 0) {
          animate();
        } else {
          setFirstPage(currentPage);
          setSecondPage(currentPage + 1);
          
          if (displayedPages === 1 && flip.direction !== forwardDirection) {
            setFlip(prev => ({ ...prev, direction: null, auto: false }));
          } else {
            onImageLoad(1, () => {
              setFlip(prev => ({ ...prev, direction: null }));
            });
            setFlip(prev => ({ ...prev, auto: false }));
          }
        }
      });
    };
    
    animate();
  }, [flip.progress, flip.direction, flipDuration, currentPage, displayedPages, forwardDirection, onImageLoad]);

  const flipLeft = useCallback(() => {
    if (!canFlipLeft) return;
    flipStart('left', true);
  }, [canFlipLeft, flipStart]);

  const flipRight = useCallback(() => {
    if (!canFlipRight) return;
    flipStart('right', true);
  }, [canFlipRight, flipStart]);

  const zoomTo = useCallback((targetZoom, zoomAt = null) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let fixedX, fixedY;
    if (zoomAt) {
      const rect = viewport.getBoundingClientRect();
      fixedX = zoomAt.pageX - rect.left;
      fixedY = zoomAt.pageY - rect.top;
    } else {
      fixedX = viewport.clientWidth / 2;
      fixedY = viewport.clientHeight / 2;
    }

    const start = zoom;
    const end = targetZoom;
    const startX = viewport.scrollLeft;
    const startY = viewport.scrollTop;
    const containerFixedX = fixedX + startX;
    const containerFixedY = fixedY + startY;
    const endX = containerFixedX / start * end - fixedX;
    const endY = containerFixedY / start * end - fixedY;

    const t0 = Date.now();
    setZooming(true);
    
    if (onZoomStart) {
      onZoomStart(targetZoom);
    }

    const animate = () => {
      zoomAnimationRef.current = requestAnimationFrame(() => {
        const t = Date.now() - t0;
        let ratio = t / zoomDuration;
        if (ratio > 1 || IE) ratio = 1;
        ratio = easeInOut(ratio);
        
        setZoom(start + (end - start) * ratio);
        setScrollLeft(startX + (endX - startX) * ratio);
        setScrollTop(startY + (endY - startY) * ratio);

        if (t < zoomDuration) {
          animate();
        } else {
          if (onZoomEnd) {
            onZoomEnd(targetZoom);
          }
          setZooming(false);
          setZoom(targetZoom);
          setScrollLeft(endX);
          setScrollTop(endY);
        }
      });
    };
    
    animate();
    
    if (end > 1) {
      preloadImages(true);
    }
  }, [zoom, zoomDuration, IE, onZoomStart, onZoomEnd, preloadImages]);

  const zoomIn = useCallback((zoomAt = null) => {
    if (!canZoomIn) return;
    const newIndex = zoomIndex + 1;
    setZoomIndex(newIndex);
    zoomTo(zooms_[newIndex], zoomAt);
  }, [canZoomIn, zoomIndex, zooms_, zoomTo]);

  const zoomOut = useCallback((zoomAt = null) => {
    if (!canZoomOut) return;
    const newIndex = zoomIndex - 1;
    setZoomIndex(newIndex);
    zoomTo(zooms_[newIndex], zoomAt);
  }, [canZoomOut, zoomIndex, zooms_, zoomTo]);

  const zoomAt = useCallback((zoomAtPoint) => {
    const newIndex = (zoomIndex + 1) % zooms_.length;
    setZoomIndex(newIndex);
    zoomTo(zooms_[newIndex], zoomAtPoint);
  }, [zoomIndex, zooms_, zoomTo]);

  const swipeStart = useCallback((touch) => {
    setTouchStartX(touch.pageX);
    setTouchStartY(touch.pageY);
    setMaxMove(0);
    
    if (zoom <= 1) {
      if (dragToFlip) {
        setActiveCursor('grab');
      }
    } else {
      setStartScrollLeft(viewportRef.current.scrollLeft);
      setStartScrollTop(viewportRef.current.scrollTop);
      setActiveCursor('all-scroll');
    }
  }, [zoom, dragToFlip]);

  const dragScroll = useCallback((x, y) => {
    setScrollLeft(startScrollLeft - x);
    setScrollTop(startScrollTop - y);
  }, [startScrollLeft, startScrollTop]);

  const swipeMove = useCallback((touch) => {
    if (touchStartX === null) return;
    
    const x = touch.pageX - touchStartX;
    const y = touch.pageY - touchStartY;
    
    setMaxMove(prev => Math.max(prev, Math.abs(x), Math.abs(y)));

    if (zoom > 1) {
      if (dragToScroll) dragScroll(x, y);
      return;
    }
    
    if (!dragToFlip) return;
    if (Math.abs(y) > Math.abs(x)) return;
    
    setActiveCursor('grabbing');
    
    if (x > 0) {
      if (flip.direction === null && canFlipLeft && x >= swipeMin) {
        flipStart('left', false);
      }
      if (flip.direction === 'left') {
        let progress = x / pageWidth;
        if (progress > 1) progress = 1;
        setFlip(prev => ({ ...prev, progress }));
      }
    } else {
      if (flip.direction === null && canFlipRight && x <= -swipeMin) {
        flipStart('right', false);
      }
      if (flip.direction === 'right') {
        let progress = -x / pageWidth;
        if (progress > 1) progress = 1;
        setFlip(prev => ({ ...prev, progress }));
      }
    }
    
    return true;
  }, [touchStartX, touchStartY, zoom, dragToScroll, dragToFlip, dragScroll, flip.direction, canFlipLeft, canFlipRight, swipeMin, pageWidth, flipStart]);

  const swipeEnd = useCallback((touch) => {
    if (touchStartX === null) return;
    
    if (clickToZoom && maxMove < swipeMin) {
      zoomAt(touch);
    }
    
    if (flip.direction !== null && !flip.auto) {
      if (flip.progress > 1/4) {
        flipAuto(false, flip.direction);
      } else {
        flipRevert();
      }
    }
    
    setTouchStartX(null);
    setActiveCursor(null);
  }, [touchStartX, clickToZoom, maxMove, swipeMin, flip.direction, flip.auto, flip.progress, zoomAt, flipAuto, flipRevert]);

  const onTouchStart = useCallback((ev) => {
    setHasTouchEvents(true);
    swipeStart(ev.changedTouches[0]);
  }, [swipeStart]);

  const onTouchMove = useCallback((ev) => {
    if (swipeMove(ev.changedTouches[0])) {
      if (ev.cancelable) ev.preventDefault();
    }
  }, [swipeMove]);

  const onTouchEnd = useCallback((ev) => {
    swipeEnd(ev.changedTouches[0]);
  }, [swipeEnd]);

  const onPointerDown = useCallback((ev) => {
    setHasPointerEvents(true);
    if (hasTouchEvents) return;
    if (ev.which && ev.which !== 1) return; // Ignore right-click
    swipeStart(ev);
    try {
      ev.target.setPointerCapture(ev.pointerId);
    } catch (e) {
      // Ignore
    }
  }, [hasTouchEvents, swipeStart]);

  const onPointerMove = useCallback((ev) => {
    if (!hasTouchEvents) swipeMove(ev);
  }, [hasTouchEvents, swipeMove]);

  const onPointerUp = useCallback((ev) => {
    if (hasTouchEvents) return;
    swipeEnd(ev);
    try {
      ev.target.releasePointerCapture(ev.pointerId);
    } catch (e) {
      // Ignore
    }
  }, [hasTouchEvents, swipeEnd]);

  const onMouseDown = useCallback((ev) => {
    if (hasTouchEvents || hasPointerEvents) return;
    if (ev.which && ev.which !== 1) return; // Ignore right-click
    swipeStart(ev);
  }, [hasTouchEvents, hasPointerEvents, swipeStart]);

  const onMouseMove = useCallback((ev) => {
    if (!hasTouchEvents && !hasPointerEvents) {
      swipeMove(ev);
    }
  }, [hasTouchEvents, hasPointerEvents, swipeMove]);

  const onMouseUp = useCallback((ev) => {
    if (!hasTouchEvents && !hasPointerEvents) {
      swipeEnd(ev);
    }
  }, [hasTouchEvents, hasPointerEvents, swipeEnd]);

  const onWheel = useCallback((ev) => {
    if (wheel === 'scroll' && zoom > 1 && dragToScroll) {
      setScrollLeft(viewportRef.current.scrollLeft + ev.deltaX);
      setScrollTop(viewportRef.current.scrollTop + ev.deltaY);
      if (ev.cancelable) ev.preventDefault();
    }

    if (wheel === 'zoom') {
      if (ev.deltaY >= 100) {
        zoomOut(ev);
        ev.preventDefault();
      } else if (ev.deltaY <= -100) {
        zoomIn(ev);
        ev.preventDefault();
      }
    }
  }, [wheel, zoom, dragToScroll, zoomIn, zoomOut]);

  const goToPage = useCallback((p) => {
    if (p === null || p === page) return;
    
    let newPage;
    if (pages[0] === null) {
      if (displayedPages === 2 && p === 1) {
        newPage = 0;
      } else {
        newPage = p;
      }
    } else {
      newPage = p - 1;
    }
    
    setCurrentPage(newPage);
    setMinX(Infinity);
    setMaxX(-Infinity);
    setCurrentCenterOffset(centerOffset);
  }, [page, pages, displayedPages, centerOffset]);

  // Effects
  useEffect(() => {
    window.addEventListener('resize', onResize, { passive: true });
    onResize();
    setZoom(zooms_[0]);
    goToPage(startPage);

    return () => {
      window.removeEventListener('resize', onResize, { passive: true });
      if (flipAnimationRef.current) {
        cancelAnimationFrame(flipAnimationRef.current);
      }
      if (zoomAnimationRef.current) {
        cancelAnimationFrame(zoomAnimationRef.current);
      }
      if (centerAnimationRef.current) {
        cancelAnimationFrame(centerAnimationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setFirstPage(currentPage);
    setSecondPage(currentPage + 1);
    preloadImages();
  }, [currentPage]);

  useEffect(() => {
    if (animatingCenter) return;
    
    const animate = () => {
      centerAnimationRef.current = requestAnimationFrame(() => {
        const rate = 0.1;
        const diff = centerOffset - (currentCenterOffset || 0);
        
        if (Math.abs(diff) < 0.5) {
          setCurrentCenterOffset(centerOffset);
          setAnimatingCenter(false);
        } else {
          setCurrentCenterOffset(prev => (prev || 0) + diff * rate);
          animate();
        }
      });
    };
    
    setAnimatingCenter(true);
    animate();
  }, [centerOffset]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    
    if (IE) {
      requestAnimationFrame(() => {
        viewport.scrollLeft = scrollLeftLimited;
      });
    } else {
      viewport.scrollLeft = scrollLeftLimited;
    }
  }, [scrollLeftLimited, IE]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    
    if (IE) {
      requestAnimationFrame(() => {
        viewport.scrollTop = scrollTopLimited;
      });
    } else {
      viewport.scrollTop = scrollTopLimited;
    }
  }, [scrollTopLimited, IE]);

  useEffect(() => {
    fixFirstPage();
  }, [pages]);

  useEffect(() => {
    if (startPage !== null) {
      goToPage(startPage);
    }
  }, [startPage]);

  // Render
  return (
    <div>
      {children && typeof children === 'function' ? children({
        canFlipLeft,
        canFlipRight,
        canZoomIn,
        canZoomOut,
        page,
        numPages,
        flipLeft,
        flipRight,
        zoomIn,
        zoomOut,
      }) : children}
      
      <div
        className={`viewport ${zooming || zoom > 1 ? 'zoom' : ''} ${dragToScroll ? 'drag-to-scroll' : ''}`}
        ref={viewportRef}
        style={{ cursor: cursor === 'grabbing' ? 'grabbing' : 'auto' }}
        onTouchMove={onTouchMove}
        onPointerMove={onPointerMove}
        onMouseMove={onMouseMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onMouseUp={onMouseUp}
        onWheel={onWheel}
      >
        <div className="flipbook-container" style={{ transform: `scale(${zoom})` }}>
          <div
            className="click-to-flip left"
            style={{ cursor: canFlipLeft ? 'pointer' : 'auto' }}
            onClick={flipLeft}
          />
          <div
            className="click-to-flip right"
            style={{ cursor: canFlipRight ? 'pointer' : 'auto' }}
            onClick={flipRight}
          />
          <div style={{ transform: `translateX(${centerOffsetSmoothed}px)` }}>
            {showLeftPage && (
              <img
                className="page fixed"
                style={{
                  width: pageWidth + 'px',
                  height: pageHeight + 'px',
                  left: xMargin + 'px',
                  top: yMargin + 'px',
                }}
                src={pageUrlLoading(leftPage, true)}
                onLoad={didLoadImage}
                alt={`Page ${leftPage + 1}`}
              />
            )}
            {showRightPage && (
              <img
                className="page fixed"
                style={{
                  width: pageWidth + 'px',
                  height: pageHeight + 'px',
                  left: viewWidth / 2 + 'px',
                  top: yMargin + 'px',
                }}
                src={pageUrlLoading(rightPage, true)}
                onLoad={didLoadImage}
                alt={`Page ${rightPage + 1}`}
              />
            )}

            <div style={{ opacity: flip.opacity }}>
              {polygonArray.map(([key, bgImage, lighting, bgPos, transform, z]) => (
                <div
                  key={key}
                  className={`polygon ${!bgImage ? 'blank' : ''}`}
                  style={{
                    backgroundImage: bgImage && `url(${loadImage(bgImage)})`,
                    backgroundSize: polygonBgSize,
                    backgroundPosition: bgPos,
                    width: polygonWidth,
                    height: polygonHeight,
                    transform: transform,
                    zIndex: z,
                  }}
                >
                  {lighting.length > 0 && (
                    <div
                      className="lighting"
                      style={{ backgroundImage: lighting }}
                    />
                  )}
                </div>
              ))}
            </div>
            
            <div
              className="bounding-box"
              style={{
                left: boundingLeft + 'px',
                top: yMargin + 'px',
                width: boundingRight - boundingLeft + 'px',
                height: pageHeight + 'px',
                cursor: cursor,
              }}
              onTouchStart={onTouchStart}
              onPointerDown={onPointerDown}
              onMouseDown={onMouseDown}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

Flipbook.propTypes = {
  pages: PropTypes.arrayOf(PropTypes.string).isRequired,
  pagesHiRes: PropTypes.arrayOf(PropTypes.string),
  flipDuration: PropTypes.number,
  zoomDuration: PropTypes.number,
  zooms: PropTypes.arrayOf(PropTypes.number),
  perspective: PropTypes.number,
  nPolygons: PropTypes.number,
  ambient: PropTypes.number,
  gloss: PropTypes.number,
  swipeMin: PropTypes.number,
  singlePage: PropTypes.bool,
  forwardDirection: PropTypes.oneOf(['right', 'left']),
  centering: PropTypes.bool,
  startPage: PropTypes.number,
  loadingImage: PropTypes.string,
  clickToZoom: PropTypes.bool,
  dragToFlip: PropTypes.bool,
  wheel: PropTypes.oneOf(['scroll', 'zoom']),
  onFlipLeftStart: PropTypes.func,
  onFlipLeftEnd: PropTypes.func,
  onFlipRightStart: PropTypes.func,
  onFlipRightEnd: PropTypes.func,
  onZoomStart: PropTypes.func,
  onZoomEnd: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
};

export default Flipbook;
