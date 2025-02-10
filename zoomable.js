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

            /* PopUp */
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
            console.error('Zoomable: Required elements with data-* attributes not found.');
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

        // this.popupImage.addEventListener('wheel', (event) => this.handleZoom(event));
        // Touchpad and mouse controls
        this.popupImage.addEventListener('wheel', (event) => {
            const isTouchpad = Math.abs(event.deltaY) < 50;

            if (isTouchpad) {
                this.handleZoom(event);
            } else if (event.metaKey || event.ctrlKey) {
                event.preventDefault();
                this.handleZoom(event);
            }
        });

        // Key controls
        document.addEventListener('keydown', (event) => {
            if (event.metaKey || event.ctrlKey) {
                if (event.key === '+' || event.key === '=') {
                    event.preventDefault();
                    this.handleZoom({ delta: -100 });
                } else if (event.key === '-') {
                    event.preventDefault();
                    this.handleZoom({ delta: 100 });
                }
            }
        });

        // document.addEventListener('keydown', (event) => {
        //     if (event.metaKey || event.ctrlKey) {
        //         switch(event.key) {
        //             case '+':
        //             case '=':
        //                 event.preventDefault();
        //                 this.handleZoom({ delta: -100 });
        //                 break;
        //             case '-':
        //                 event.preventDefault();
        //                 this.handleZoom({ delta: 100 });
        //                 break;
        //         }
        //     }
        // });

        // Phone controls

    }

    openPopup() {
        this.overlayElement.classList.add('active');
    }

    closePopup() {
        this.overlayElement.classList.remove('active');
        this.resetZoom();
    }

    // handleZoom(event) {
    //     event.preventDefault();
    //     const delta = event.deltaY > 0 ? -0.05 : 0.05;
    //     this.zoomLevel = Math.min(Math.max(this.zoomLevel + delta, this.zoomLimits.min), this.zoomLimits.max);
    //     this.popupImage.style.transform = `scale(${this.zoomLevel})`;
    // }   

    handleZoom(event) {
        if (event.preventDefault) event.preventDefault();

        let delta;
        if (typeof event.deltaY !== 'undefined') {
            delta = event.deltaY > 0 ? -0.5 : 0.5;
        } else {
            delta = event.delta < 0 ? 0.5 : -0.5;
        }

        this.zoomLevel = Math.min(Math.max(this.zoomLevel + delta, this.zoomLimits.min), this.zoomLimits.max);
        this.popupImage.style.transform = `scale(${this.zoomLevel})`;
    }

}

document.addEventListener('DOMContentLoaded', () => {
    new Zoomable();
});