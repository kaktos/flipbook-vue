# Migration Guide: Vue to React

This guide helps you migrate from `flipbook-vue` to `flipbook-react`.

## Installation

**Vue:**
```bash
npm install flipbook-vue
```

**React:**
```bash
npm install flipbook-react
```

## Basic Usage

**Vue:**
```vue
<template>
  <flipbook class="flipbook" :pages="pages"></flipbook>
</template>

<script>
import Flipbook from 'flipbook-vue'

export default {
  components: { Flipbook },
  data() {
    return {
      pages: ['image1.jpg', 'image2.jpg']
    }
  }
}
</script>

<style>
.flipbook {
  width: 90vw;
  height: 90vh;
}
</style>
```

**React:**
```jsx
import React, { useState } from 'react';
import Flipbook from 'flipbook-react';

function App() {
  const [pages] = useState(['image1.jpg', 'image2.jpg']);

  return (
    <div style={{ width: '90vw', height: '90vh' }}>
      <Flipbook pages={pages} />
    </div>
  );
}
```

## Events

**Vue:**
```vue
<template>
  <flipbook
    :pages="pages"
    @flip-left-end="onFlipLeftEnd"
    @flip-right-end="onFlipRightEnd"
  />
</template>

<script>
export default {
  methods: {
    onFlipLeftEnd(page) {
      console.log('Page:', page);
    },
    onFlipRightEnd(page) {
      console.log('Page:', page);
    }
  }
}
</script>
```

**React:**
```jsx
<Flipbook
  pages={pages}
  onFlipLeftEnd={(page) => console.log('Page:', page)}
  onFlipRightEnd={(page) => console.log('Page:', page)}
/>
```

## Slot Props / Render Props

**Vue:**
```vue
<template>
  <flipbook :pages="pages" v-slot="flipbook">
    <button @click="flipbook.flipLeft">Previous</button>
    <button @click="flipbook.flipRight">Next</button>
  </flipbook>
</template>
```

**React:**
```jsx
<Flipbook pages={pages}>
  {(flipbook) => (
    <>
      <button onClick={flipbook.flipLeft}>Previous</button>
      <button onClick={flipbook.flipRight}>Next</button>
    </>
  )}
</Flipbook>
```

## Accessing Methods via Refs

**Vue:**
```vue
<template>
  <flipbook ref="flipbook" :pages="pages" />
</template>

<script>
export default {
  mounted() {
    this.$refs.flipbook.flipLeft();
  }
}
</script>
```

**React:**

In React, use the render props pattern instead:

```jsx
function App() {
  const flipbookRef = useRef(null);

  return (
    <Flipbook pages={pages}>
      {(flipbook) => {
        // Store methods in ref if needed
        flipbookRef.current = flipbook;
        return <YourControls />;
      }}
    </Flipbook>
  );
}
```

## Props Comparison

All props work the same way in both versions:

| Prop | Vue | React |
|------|-----|-------|
| pages | `:pages="pages"` | `pages={pages}` |
| flipDuration | `:flip-duration="1000"` | `flipDuration={1000}` |
| singlePage | `:single-page="true"` | `singlePage={true}` |
| startPage | `:start-page="5"` | `startPage={5}` |

Note: React uses camelCase for prop names instead of kebab-case.

## Event Names

| Vue Event | React Callback |
|-----------|----------------|
| `@flip-left-start` | `onFlipLeftStart` |
| `@flip-left-end` | `onFlipLeftEnd` |
| `@flip-right-start` | `onFlipRightStart` |
| `@flip-right-end` | `onFlipRightEnd` |
| `@zoom-start` | `onZoomStart` |
| `@zoom-end` | `onZoomEnd` |

## CSS Classes

Both versions use the same CSS class names, so your custom styles will work without changes:

- `.viewport`
- `.bounding-box`
- `.page`
- `.polygon`
- `.lighting`

## TypeScript Support

The React version includes TypeScript definitions out of the box:

```tsx
import Flipbook, { FlipbookProps, FlipbookRenderProps } from 'flipbook-react';

const MyComponent: React.FC = () => {
  const pages: string[] = ['image1.jpg', 'image2.jpg'];
  
  return <Flipbook pages={pages} />;
};
```

## Key Differences

1. **Event Handling**: Vue uses `@event-name` while React uses `onEventName` callbacks
2. **Prop Naming**: Vue uses kebab-case (`:flip-duration`) while React uses camelCase (`flipDuration`)
3. **Render Props**: Vue uses `v-slot` while React uses children as function
4. **Refs**: Vue uses `$refs` while React uses render props for accessing methods

## Performance

Both versions have similar performance characteristics as they use the same core logic and 3D transformation techniques.
