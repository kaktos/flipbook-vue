# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-11-12

### Added
- Initial React conversion of flipbook-vue component
- Full feature parity with Vue version (1.0.0-beta.4)
- React 18+ support with modern hooks
- TypeScript definitions for better development experience
- Comprehensive documentation:
  - README.md with full API documentation
  - QUICKSTART.md for quick setup
  - MIGRATION.md for Vue to React migration
  - COMPARISON.md comparing Vue and React implementations
- Example application demonstrating usage
- PropTypes validation for runtime type checking

### Features
- 3D page flip animations with realistic lighting effects
- Multi-level zoom functionality
- Touch and mouse gesture support
- Single and double page display modes
- Responsive layout (auto-switches between single/double page)
- High-resolution image support for zooming
- Customizable animation durations
- Configurable perspective and lighting
- Click-to-zoom functionality
- Drag-to-flip page turning
- Mouse wheel zoom/scroll support
- Event callbacks for all interactions:
  - onFlipLeftStart, onFlipLeftEnd
  - onFlipRightStart, onFlipRightEnd
  - onZoomStart, onZoomEnd
- Render props pattern for custom controls
- RTL (right-to-left) reading direction support
- Custom loading image support
- Page centering option
- Start page configuration

### Technical Implementation
- Converted from Vue + CoffeeScript to React + JavaScript
- Uses React Hooks:
  - useState for state management
  - useEffect for lifecycle and side effects
  - useMemo for computed values
  - useCallback for memoized callbacks
  - useRef for DOM references
- Optimized rendering with dependency tracking
- Same Matrix transformation logic as Vue version
- Same CSS styling (compatible with Vue version styles)
- Uses rematrix library for 3D transformations
- PropTypes for runtime validation
- TypeScript definitions for compile-time checking

### Dependencies
- react: >=18.0.0
- react-dom: >=18.0.0
- prop-types: ^15.8.1
- rematrix: ^0.7.2

### Browser Support
- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

### Credits
- Original Vue component: flipbook-vue by Takeshi Sone
- React conversion: Based on flipbook-vue 1.0.0-beta.4
- Matrix transformations: rematrix library

### Breaking Changes from Vue Version
None - Full API compatibility maintained through prop and callback naming conventions.
All Vue kebab-case props converted to React camelCase (e.g., `flip-duration` → `flipDuration`).
All Vue events converted to React callbacks (e.g., `@flip-left-end` → `onFlipLeftEnd`).

## Version Mapping

| flipbook-react | flipbook-vue | Notes |
|----------------|--------------|-------|
| 1.0.0 | 1.0.0-beta.4 | Initial React conversion with full feature parity |
