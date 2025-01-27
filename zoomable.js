class Zoomable {
    constructor() {
        // Importing CSS styles
        if (!document.querySelector('#zoomable-popup-styles')) {
    const styleTag = document.createElement('style');
    styleTag.id = 'zoomable-popup-styles';
    styleTag.textContent = `
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
        }

        /* Pop Up */
        .zoomable-popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #00000078;
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10;
        }

        .zoomable-popup-overlay.active {
            display: flex;
        }

        .zoomable-popup-container {
            position: relative;
            margin: 0;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .zoomable-popup-content {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .zoomable-popup-image {
            border-radius: 10px;
            max-width: 100%;
            max-height: 100%;
            cursor: default;
            max-width: none;
            max-height: none;
            position: absolute;
            transform-origin: center;
            transition: transform 0.1s ease-in-out;
        }

        .zoomable-close-zone {
            color: transparent;
            font-family: monospace;
            width: 50%;
            top: -30px;
            left: 130px;
            font-size: 20px;
            position: absolute;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            z-index: 20;
            display: none;
        }

        p {
            color: white;
        }
    `;
    document.head.appendChild(styleTag);
}




        // Automatically detect elements by their data-* attributes
        this.triggerElement = document.querySelector('[data-zoom-trigger]');
        this.overlayElement = document.querySelector('[data-zoom-overlay]');
        this.closeElement = document.querySelector('[data-zoom-close]');
        this.popupImage = document.querySelector('[data-zoom-image]');

        // Get custom configuration from the image's data-* attributes
        const zoomMin = this.popupImage?.dataset.zoomMin || 1;
        const zoomMax = this.popupImage?.dataset.zoomMax || 3;

        // Zoom configuration
        this.zoomLevel = 1;
        this.zoomLimits = { min: parseFloat(zoomMin), max: parseFloat(zoomMax) };

        // Initialize logic if elements are defined
        if (this.triggerElement && this.overlayElement && this.popupImage) {
            this.init();
        } else {
            console.error('ZoomablePopup: Required elements with data-* attributes not found.');
        }
    }

    init() {
        // Open the popup
        this.triggerElement.addEventListener('click', () => this.openPopup());

        // Close the popup
        if (this.closeElement) {
            this.closeElement.addEventListener('click', () => this.closePopup());
        }
        this.overlayElement.addEventListener('click', (event) => {
            if (event.target === this.overlayElement) this.closePopup();
        });

        // Zoom with the mouse wheel
        this.popupImage.addEventListener('wheel', (event) => this.handleZoom(event));
    }

    openPopup() {
        this.overlayElement.classList.add('active');
    }

    closePopup() {
        this.overlayElement.classList.remove('active');
        this.resetZoom();
    }

    handleZoom(event) {
        event.preventDefault();
        const delta = event.deltaY > 0 ? -0.1 : 0.1; // Increase or decrease zoom
        this.zoomLevel = Math.min(Math.max(this.zoomLevel + delta, this.zoomLimits.min), this.zoomLimits.max);
        this.popupImage.style.transform = `scale(${this.zoomLevel})`;
    }

    resetZoom() {
        this.zoomLevel = 1;
        this.popupImage.style.transform = `scale(1)`;
    }
}

// Automatically initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Zoomable();
});