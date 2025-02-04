class Zoomable {
    constructor() {
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
            max-width: 70%;
            max-height: 70%;
            cursor: default;
            max-width: none;
            max-height: none;
            position: absolute;
            transition: transform 0.5s ease-in-out; 
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
        this.triggerElement = document.querySelector('[data-zoom-trigger]');
        this.overlayElement = document.querySelector('[data-zoom-overlay]');
        this.closeElement = document.querySelector('[data-zoom-close]');
        this.popupImage = document.querySelector('[data-zoom-image]');

        const zoomMin = this.popupImage?.dataset.zoomMin || 1;
        const zoomMax = this.popupImage?.dataset.zoomMax || 3;

        this.zoomLevel = 1;
        this.zoomLimits = { min: parseFloat(zoomMin), max: parseFloat(zoomMax) };

        if (this.triggerElement && this.overlayElement && this.popupImage) {
            this.init();
        } else {
            console.error('ZoomablePopup: Required elements with data-* attributes not found.');
        }
    }

    init() {
        this.triggerElement.addEventListener('click', () => this.openPopup());

        if (this.closeElement) {
            this.closeElement.addEventListener('click', () => this.closePopup());
        }
        this.overlayElement.addEventListener('click', (event) => {
            if (event.target === this.overlayElement) this.closePopup();
        });

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
        const delta = event.deltaY > 0 ? -0.05 : 0.05;
        this.zoomLevel = Math.min(Math.max(this.zoomLevel + delta, this.zoomLimits.min), this.zoomLimits.max);
        this.popupImage.style.transform = `scale(${this.zoomLevel})`;
    }   
}
document.addEventListener('DOMContentLoaded', () => {
    new Zoomable();
});