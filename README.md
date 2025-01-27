# Test Library

## 1. Installation

### 1.1. Add the library to your project via npm:

```bash
npm install test-library
```

### 1.2. Include the library in your project:

```html
<script src="/path/to/zoomable-popup.js"></script>
<link rel="stylesheet" href="/path/to/zoomable-popup.css" />
```

## 2. Usage

### 2.1. Add the required HTML structure to your project.

```html
<div class="zoomable-basic-image-container">
  <img src="example.jpg" alt="example" class="zoomable-basic-image" data-zoomable="true" data-zoom-limit="3" />
</div>
<div class="zoomable-popup-overlay">
  <div class="zoomable-popup-container">
    <div class="zoomable-popup-content">
      <img src="" alt="Zoomed image" class="zoomable-popup-image" />
    </div>
  </div>
</div>
```

#### Required attributes:

- `data-zoomable`: Indicates that the image should trigger the zoom popup when clicked.
- `data-zoom-limit`: Sets the maximum zoom level (default: 3).

### 2.2 Initialize the library in your JavaScript file:

```javascript
import ZoomablePopup from 'zoomable-popup';

const zoomable = new ZoomablePopup({
  overlaySelector: '.zoomable-popup-overlay',
  popupImageSelector: '.zoomable-popup-image',
  triggerSelector: '[data-zoomable]',
});

zoomable.init();
```

## 3. Customization Options for HTML

- `data-zoom-trigger`: Element that opens the popup.
- `data-zoom-overlay`: Container of the popup.
- `data-zoom-close`: Element that closes the popup.
- `data-zoom-image`: Image that can be zoomed.
- `data-zoom-min`: Minimum zoom level (default: 1).
- `data-zoom-max`: Maximum zoom level (default: 3).

## 4. Customization Options

When initializing the library, you can pass the following options:

| Option               | Type   | Default                   | Description                                     |
| -------------------- | ------ | ------------------------- | ----------------------------------------------- |
| `overlaySelector`    | string | `.zoomable-popup-overlay` | Selector for the popup overlay element.         |
| `popupImageSelector` | string | `.zoomable-popup-image`   | Selector for the image displayed in the popup.  |
| `triggerSelector`    | string | `[data-zoomable]`         | Selector for the images that trigger the popup. |
| `zoomLimit`          | number | `3`                       | Maximum zoom level for the popup image.         |

## 5. Classes and Styling

The library uses a set of pre-defined classes for styling. You can customize these classes in your CSS or overwrite them as needed. Below is a guide to each class and its purpose:

### 5.1. General Classes

| Class Name                       | Description                                             |
| -------------------------------- | ------------------------------------------------------- |
| `zoomable-basic-image-container` | Container for the image that triggers the popup.        |
| `zoomable-basic-image`           | The image that users click on to open the popup.        |
| `zoomable-popup-overlay`         | The dark overlay that appears when the popup is active. |
| `zoomable-popup-container`       | Container for the zoomed image and content.             |
| `zoomable-popup-content`         | Wrapper for the zoomed image.                           |
| `zoomable-popup-image`           | The zoomed image displayed in the popup.                |

### 5.2. Key Styles

Here are the default styles applied by the library. These can be customized in your project:

```css
/* Basic Image */
.zoomable-basic-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.zoomable-basic-image {
  max-width: 20%;
  max-height: 20%;
  border-radius: 10px;
  cursor: pointer;
}

/* Pop Up */
.zoomable-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.zoomable-popup-overlay.active {
  display: flex;
}

.zoomable-popup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.zoomable-popup-content {
  display: flex;
  justify-content: center;
  align-items: center;
}

.zoomable-popup-image {
  max-width: none;
  max-height: none;
  border-radius: 10px;
  transform-origin: center;
  transition: transform 0.1s ease-in-out;
}
```

### 5.3. Custom CSS

You can overwrite the default styles by adding your own CSS rules. For example:

```css
.zoomable-popup-overlay {
  background: rgba(255, 255, 255, 0.9);
}

.zoomable-popup-image {
  border-radius: 0;
}
```

### 5.4. Events

The library provides hooks for key actions. You can attach event listeners like this:

```javascript
zoomable.on('open', (image) => {
  console.log('Popup opened for:', image.src);
});

zoomable.on('close', () => {
  console.log('Popup closed');
});
```

#### Available Events

| Event   | Description                     | Arguments                                            |
| ------- | ------------------------------- | ---------------------------------------------------- |
| `open`  | Fired when the popup is opened. | `image`: The image element that triggered the popup. |
| `close` | Fired when the popup is closed. | None                                                 |

## 6. Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 7. Credits

Developed by Maryuxy.
