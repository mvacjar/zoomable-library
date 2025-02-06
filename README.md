# Test Library

## 1. Installation

### 1.1. Add the library to your project via npm:

```bash
npm install test-library
```

### 1.2. Include the library in your project:

```html
<script defer src="/path/to/zoomable.js"></script>
```

Make sure you have the necessary HTML structure (see Usage section).

#### Initialization

The library initializes automatically when the page content is fully loaded:

```js
document.addEventListener('DOMContentLoaded', () => {
  new Zoomable();
});
```

## 2. Usage

### 2.1. HTML Structure

Add the following elements to your HTML:

```html
<div class="zoomable-basic-image-container">
  <img src="" alt="example" class="zoomable-basic-image" data-zoom-trigger />
</div>
<div class="zoomable-popup-overlay" data-zoom-overlay data-zoom-close>
  <div class="zoomable-popup-container">
    <div class="zoomable-popup-content">
      <img src="" alt="Zoomed image" class="zoomable-popup-image" data-zoom-image />
    </div>
  </div>
</div>
```

#### Required attributes:

Customize the zoom behavior using data-\* attributes on your image:

- `data-zoom-trigger`: Specifies the image that will trigger the popup when clicked.

- `data-zoom-overlay`: Defines the overlay container that will be displayed.

- `data-zoom-image`: The image inside the popup that will have zoom functionality.

#### Optional attributes:

- `data-zoom-min`: (Optional) Minimum zoom level. Default value: 1.

- `data-zoom-max`: (Optional) Maximum zoom level. Default value: 3.

#### Full Example

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Zoomable</title>
    <script defer src="./zoomable.js"></script>
  </head>

  <body>
    <div class="zoomable-basic-image-container">
      <img src="" alt="example" class="zoomable-basic-image" data-zoom-trigger />
    </div>
    <div class="zoomable-popup-overlay" data-zoom-overlay data-zoom-close>
      <div class="zoomable-popup-container">
        <div class="zoomable-popup-content">
          <img src="" alt="Zoomed image" class="zoomable-popup-image" data-zoom-image data-zoom-min="1" data-zoom-max="3" />
        </div>
      </div>
    </div>
  </body>
</html>
```

## 4. Configuration Options in JS

When initializing the library, you can pass the following options:

| Option               | Type   | Default                   | Description                                                                            |
| -------------------- | ------ | ------------------------- | -------------------------------------------------------------------------------------- |
| `overlaySelector`    | string | `.zoomable-popup-overlay` | Selector for the popup overlay element.                                                |
| `popupImageSelector` | string | `.zoomable-popup-image`   | Selector for the image displayed in the popup.                                         |
| `triggerSelector`    | string | `[data-zoom-trigger]`     | Selector for the images that trigger the popup.                                        |
| `zoomLimits`         | object | `{ min: 1, max: 3 }`      | Object specifying the minimum (data-zoom-min) and maximum (data-zoom-max) zoom levels. |
| `zoomLevel`          | number | `1`                       | Current zoom level, initialized to 1.                                                  |

## 5. Configuration Options in CSS

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

/* Modal */
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

## 6. Contributing

Contributions are welcome! If you find any bugs or want to suggest improvements, feel free to open an issue or submit a pull request.

## 7. Credits

Developed by Maryuxy.
