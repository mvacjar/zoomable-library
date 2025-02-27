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
                    max-width: 50%;
                    max-height: 50%;
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

                .close-button-container {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    z-index: 20;
                }

                .close-button {
                    background: #fff;
                    border: none;
                    border-radius: 50%;
                    width: 25px;
                    height: 25px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 15px;
                    line-height: 20px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.26);
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
                }
            `;
            document.head.appendChild(styleTag);
        }

        this.triggerElement = document.querySelector('[data-zoom-trigger]');
        this.overlayElement = document.querySelector('[data-zoom-overlay]');
        this.popupImage = document.querySelector('[data-zoom-image]');
        this.closeElement = document.querySelector('[data-zoom-close]');
        this.closeButton = document.querySelector('.close-button');

        const zoomMin = this.popupImage?.dataset.zoomMin || 1;
        const zoomMax = this.popupImage?.dataset.zoomMax || 6;

        this.zoomLevelsKeyboard = [1, 2, 3, 4, 5, 6];
        this.zoomLevelsTouchpad = [1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 6];
        this.zoomIndexKeyboard = 0;
        this.zoomIndexTouchpad = 0;
        this.zoomLimits = { min: parseFloat(zoomMin), max: parseFloat(zoomMax) };

        if (this.triggerElement && this.overlayElement && this.popupImage) {
            this.init();
        } else {
            console.error('Zoomable: Required elements with data-* attributes not found.');
        }
    }

    init() {
        this.triggerElement.addEventListener('click', () => this.openPopup());

        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.closePopup());
        }

         if (this.closeElement) {
            this.closeElement.addEventListener('click', () => this.closePopup());
        }
        this.overlayElement.addEventListener('click', (event) => {
            if (event.target === this.overlayElement) this.closePopup();
        });
        

        this.overlayElement.addEventListener('wheel', (event) => {
            if (event.ctrlKey) {
                event.preventDefault();
                this.handleTouchpadZoom(event);
            }
        });

        document.addEventListener('keydown', (event) => this.handleKeyboardZoom(event));
        this.overlayElement.addEventListener('touchstart', (event) => this.handleTouchStart(event), { passive: false });
        this.overlayElement.addEventListener('touchmove', (event) => this.handleTouchMove(event), { passive: false });  
    }

    handleKeyboardZoom(event) {
        if (event.metaKey || event.ctrlKey) {
            if (event.key === '+') {
                event.preventDefault();
                this.handleZoom(1, 'keyboard');
            } else if (event.key === '-') {
                event.preventDefault();
                this.handleZoom(-1, 'keyboard');
            }
        }
    }

    handleTouchpadZoom(event) {
    if (event.ctrlKey) {
        event.preventDefault();
        const direction = event.deltaY > 0 ? -1 : 1;
        this.handleZoom(direction, 'touchpad');
    }
}


    handleTouchStart(event) {
        if (event.touches.length === 2) {
            this.initialPinchDistance = this.getPinchDistance(event.touches);
        }
    }

    handleTouchMove(event) {
        if (event.touches.length === 2) {
            event.preventDefault();
            const newDistance = this.getPinchDistance(event.touches);
            if (this.initialPinchDistance) {
                const scaleFactor = newDistance / this.initialPinchDistance;
                if (scaleFactor > 1.1) { 
                    this.handleZoom(0.1, 'touchpad');
                    this.initialPinchDistance = newDistance;
                } else if (scaleFactor < 0.9) {
                    this.handleZoom(-0.1, 'touchpad');
                    this.initialPinchDistance = newDistance;
                }
            }
        }
    }

    getPinchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    handleZoom(direction, inputType) {
        let newIndex;
        if (inputType === 'keyboard') {
            newIndex = this.zoomIndexKeyboard + direction;
            if (newIndex >= 0 && newIndex < this.zoomLevelsKeyboard.length) {
                this.zoomIndexKeyboard = newIndex;
                this.popupImage.style.transform = `scale(${this.zoomLevelsKeyboard[this.zoomIndexKeyboard]})`;
            }
        } else if (inputType === 'touchpad') {
            newIndex = this.zoomIndexTouchpad + direction;
            if (newIndex >= 0 && newIndex < this.zoomLevelsTouchpad.length) {
                this.zoomIndexTouchpad = newIndex;
                this.popupImage.style.transform = `scale(${this.zoomLevelsTouchpad[this.zoomIndexTouchpad]})`;
            }
        }
    }
    

    openPopup() {
        this.overlayElement.classList.add('active');
    }

    closePopup() {
        this.overlayElement.classList.remove('active');
        this.resetZoom();
    }

    resetZoom() {
        this.zoomIndexKeyboard = 0;
        this.zoomIndexTouchpad = 0;
        this.popupImage.style.transform = `scale(${this.zoomLevelsKeyboard[0]})`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Zoomable();
});







