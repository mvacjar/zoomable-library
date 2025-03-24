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

                /* Zoom Controls*/

                .zoomable-controls {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0, 0, 0, 0.6);
                    padding: 10px;
                    border-radius: calc(0.5* 50px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 100;
                    height: 25px;
                }

                .zoomable-controls button {
                    background: #fff;
                    border: none;
                    padding: 10px;
                    margin: 0 10px;
                    cursor: pointer;
                    font-size: 20px;
                    border-radius: 50%; 
                    width: 30px; 
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
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
                    height: 100%;
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
                    position: relative;
                    width: 100%;
                    height: 100%;
                }

                .zoomable-popup-image {
                    border-radius: 10px;
                    max-width: 70%;
                    max-height: 70%;
                    cursor: grab;
                    transition: transform 0.1s ease; /* Smooth transition for zoom out */
                    transform-origin: center center;
                    position: relative; /* Changed from absolute to relative */
                }
                
                .zoomable-popup-image.dragging {
                    cursor: grabbing;
                }
            `;
            document.head.appendChild(styleTag);
        }

        this.triggerElement = document.querySelector('[data-zoom-trigger]');
        this.overlayElement = document.querySelector('[data-zoom-overlay]');
        this.popupImage = document.querySelector('[data-zoom-image]');
        this.closeElement = document.querySelector('[data-zoom-close]');
        this.closeButton = document.querySelector('.close-button');

        this.zoomInButton = document.querySelector('.zoom-in');
        this.zoomOutButton = document.querySelector('.zoom-out');
        this.zoomMenu = document.querySelector('.zoomable-controls');

        const zoomMin = this.popupImage?.dataset.zoomMin || 1;
        const zoomMax = this.popupImage?.dataset.zoomMax || 6;

        this.zoomLevelsKeyboard = [1, 2, 3, 4, 5, 6];
        this.zoomLevelsTouchpad = [1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.4, 2.6, 2.8, 3, 3.2, 3.4, 3.6, 3.8, 4, 4.2, 4.4, 4.6, 4.8, 5, 5.2, 5.4, 5.6, 5.8, 6];
        this.zoomIndexKeyboard = 0;
        this.zoomIndexTouchpad = 0;
        this.zoomLimits = { min: parseFloat(zoomMin), max: parseFloat(zoomMax) };

        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.translateX = 0;
        this.translateY = 0;
        this.currentTranslateX = 0;
        this.currentTranslateY = 0;

        this.isZoomedTo75 = false;
        this.activeZoomMethod = 'keyboard';

        if (this.triggerElement && this.overlayElement && this.popupImage) {
            this.init();
        }
    }

    init() {
        this.triggerElement.addEventListener('click', () => this.openPopup());

        this.overlayElement.addEventListener('click', (event) => {
            const zoomMenuElement = this.zoomMenu || document.querySelector('.zoomable-controls');
    
            if (this.closeButton && this.closeButton.contains(event.target)) {
                this.closePopup();
                return;
            }
    
            const isClickOutside = !this.popupImage.contains(event.target) && !zoomMenuElement.contains(event.target);
    
            if (isClickOutside) {
                this.closePopup();
            }
        });
        
        this.overlayElement.addEventListener('wheel', (event) => {
            if (event.ctrlKey) {
                event.preventDefault();
                this.handleTouchpadZoom(event);
            }
        });

        if (this.zoomInButton) {
            this.zoomInButton.addEventListener('click', () => this.handleZoom(1, 'manual'));
        }
        if (this.zoomOutButton) {
            this.zoomOutButton.addEventListener('click', () => this.handleZoom(-1, 'manual'));
        }


        document.addEventListener('keydown', (event) => this.handleKeyboardZoom(event));
        this.overlayElement.addEventListener('touchstart', (event) => this.handleTouchStart(event), { passive: false });
        this.overlayElement.addEventListener('touchmove', (event) => this.handleTouchMove(event), { passive: false });  

        this.popupImage.addEventListener('mousedown', (event) => this.handleDragStart(event));
        window.addEventListener('mousemove', (event) => this.handleDragMode(event));
        window.addEventListener('mouseup', () => this.handleDragEnd());

        this.popupImage.addEventListener('touchstart', (event) => this.startDragTouch(event), { passive: false });
        window.addEventListener('touchmove', (event) => this.handleDragTouch(event), { passive: false });
        window.addEventListener('touchend', () => this.handleDragEnd());
        
        this.popupImage.addEventListener('dblclick', (event) => this.handleDoubleClick(event));
        this.updateZoomPercentage();
    }

    handleDragStart(event) {
        // Solo permitir arrastrar si la imagen está ampliada
        if (this.getCurrentZoomLevel() > 1) {
            this.isDragging = true;
            this.popupImage.classList.add('dragging');
            this.startX = event.clientX;
            this.startY = event.clientY;
            // Guardar posición actual
            this.translateX = this.currentTranslateX;
            this.translateY = this.currentTranslateY;
            event.preventDefault();
        }
    }

    handleDragMode(event) {
        if (this.isDragging) {
            const x = event.clientX - this.startX;
            const y = event.clientY - this.startY;
            
            this.currentTranslateX = this.translateX + x;
            this.currentTranslateY = this.translateY + y;
            
            this.applyBoundaries();
            this.updateImageTransform();
        }
    }

    handleDragEnd() {
        if (this.isDragging) {
            this.isDragging = false;
            this.popupImage.classList.remove('dragging');
        }
    }

    startDragTouch(event) {
        if (event.touches.length === 1 && this.getCurrentZoomLevel() > 1) {
            this.isDragging = true;
            this.popupImage.classList.add('dragging');
            this.startX = event.touches[0].clientX;
            this.startY = event.touches[0].clientY;
            this.translateX = this.currentTranslateX;
            this.translateY = this.currentTranslateY;
            event.preventDefault();
        }
    }

    handleDragTouch(event) {
        if (this.isDragging && event.touches.length === 1) {
            const x = event.touches[0].clientX - this.startX;
            const y = event.touches[0].clientY - this.startY;
            
            this.currentTranslateX = this.translateX + x;
            this.currentTranslateY = this.translateY + y;
            
            this.applyBoundaries();
            this.updateImageTransform();
            event.preventDefault();
        }
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

    syncZoomIndices() {
        const currentZoom = this.getCurrentZoomLevel();
        
        let nearestKeyboardIndex = 0;
        let minDifference = Math.abs(this.zoomLevelsKeyboard[0] - currentZoom);
        
        for (let i = 1; i < this.zoomLevelsKeyboard.length; i++) {
            const diff = Math.abs(this.zoomLevelsKeyboard[i] - currentZoom);
            if (diff < minDifference) {
                minDifference = diff;
                nearestKeyboardIndex = i;
            }
        }
        
        this.zoomIndexKeyboard = nearestKeyboardIndex;
    }

    handleZoom(direction, inputType) {
        this.activeZoomMethod = inputType;
        
        let newIndex;
        let currentZoom = this.getCurrentZoomLevel();
        let newZoom;

        if (inputType === 'keyboard') {
            newIndex = this.zoomIndexKeyboard + direction;
            if (newIndex >= 0 && newIndex < this.zoomLevelsKeyboard.length) {
                this.zoomIndexKeyboard = newIndex;
                newZoom = this.zoomLevelsKeyboard[this.zoomIndexKeyboard];
                
                this.zoomIndexTouchpad = 0;
                
                if (direction < 0) {
                    this.adjustPositionOnZoomOut(currentZoom, newZoom);
                }
                
                this.updateImageTransform();
            }
        } else if (inputType === 'touchpad') {
            newIndex = this.zoomIndexTouchpad + direction;

            if (newIndex >= 0 && newIndex < this.zoomLevelsTouchpad.length) {
                this.zoomIndexTouchpad = newIndex;
                newZoom = this.zoomLevelsTouchpad[this.zoomIndexTouchpad];
                 this.syncZoomIndices();
                
                if (direction < 0) {
                    this.adjustPositionOnZoomOut(currentZoom, newZoom);
                }
                
                this.updateImageTransform();
            }
        } else if (inputType === 'manual') {
            this.syncZoomIndices();
            
            if (direction > 0) {
                if (this.zoomIndexKeyboard < this.zoomLevelsKeyboard.length - 1) {
                    this.zoomIndexKeyboard += 1;
                    newZoom = this.zoomLevelsKeyboard[this.zoomIndexKeyboard];

                    this.zoomIndexTouchpad = 0;
                    
                    this.updateImageTransform();
                }
            } else {
                if (this.zoomIndexKeyboard > 0) {
                    currentZoom = this.getCurrentZoomLevel();
                    this.zoomIndexKeyboard -= 1;
                    newZoom = this.zoomLevelsKeyboard[this.zoomIndexKeyboard];
                    
                    this.zoomIndexTouchpad = 0;
                    
                    this.adjustPositionOnZoomOut(currentZoom, newZoom);
                    this.updateImageTransform();
                }
            }
        }
        this.updateZoomPercentage();
    }

    updateZoomPercentage() {
        if (!this.zoomPercentageDisplay) return;
        
        const currentZoom = this.getCurrentZoomLevel();
        const maxZoom = this.zoomLimits.max;
        const percentage = Math.round((currentZoom / maxZoom) * 100);
        this.zoomPercentageDisplay.textContent = `${percentage}%`;
    }

    getCurrentZoomLevel() {
        return this.zoomIndexTouchpad > 0 
            ? this.zoomLevelsTouchpad[this.zoomIndexTouchpad] 
            : this.zoomLevelsKeyboard[this.zoomIndexKeyboard];
    }
    
    adjustPositionOnZoomOut(currentZoom, newZoom) {
        const zoomRatio = newZoom / currentZoom;
        
        this.currentTranslateX = this.currentTranslateX * zoomRatio;
        this.currentTranslateY = this.currentTranslateY * zoomRatio;
        
        if (newZoom <= 1.05) {
            this.currentTranslateX = 0;
            this.currentTranslateY = 0;
        }
    }
    
    updateImageTransform() {
        const zoomLevel = this.getCurrentZoomLevel();
        this.popupImage.style.transform = `scale(${zoomLevel}) translate(${this.currentTranslateX / zoomLevel}px, ${this.currentTranslateY / zoomLevel}px)`;
    }
    
    openPopup() {
        this.overlayElement.classList.add('active');
            this.resetZoom();
     
    }

    closePopup() {
        this.overlayElement.classList.remove('active');
        this.resetZoom();
    }

    resetZoom() {
        this.zoomIndexKeyboard = 0;
        this.zoomIndexTouchpad = 0;
        this.currentTranslateX = 0;
        this.currentTranslateY = 0;
        this.popupImage.style.transform = 'scale(1)';
        this.isZoomedTo75 = false;
        this.updateZoomPercentage();
    }
    
    handleDoubleClick(event) {
        event.preventDefault();
        
        if (this.isZoomedTo75) {
            this.resetZoom();
        } else {
            const maxZoom = this.zoomLimits.max;
            const targetZoom = maxZoom * 0.75;
            
            let targetIndex = this.zoomLevelsKeyboard.findIndex(level => level >= targetZoom);
            let zoomArray = this.zoomLevelsKeyboard;
            let zoomIndexProp = 'zoomIndexKeyboard';
            
            if (targetIndex === -1 || 
                (this.zoomLevelsTouchpad.some(level => Math.abs(level - targetZoom) < Math.abs(this.zoomLevelsKeyboard[targetIndex] - targetZoom)))) {
                targetIndex = this.zoomLevelsTouchpad.findIndex(level => level >= targetZoom);
                zoomArray = this.zoomLevelsTouchpad;
                zoomIndexProp = 'zoomIndexTouchpad';
                
                if (targetIndex === -1) {
                    targetIndex = this.zoomLevelsTouchpad.length - 1;
                }
            }
            
            const currentZoom = this.getCurrentZoomLevel();
            
            this[zoomIndexProp] = targetIndex;
            const newZoom = zoomArray[targetIndex];
            
            if (zoomIndexProp === 'zoomIndexTouchpad') {
                this.syncZoomIndices();
            }
            
            const rect = this.popupImage.getBoundingClientRect();
            
            const imageCenterX = rect.left + rect.width / 2;
            const imageCenterY = rect.top + rect.height / 2;
            
            const clickOffsetX = event.clientX - imageCenterX;
            const clickOffsetY = event.clientY - imageCenterY;
            
            const zoomRatio = newZoom / currentZoom;
            
            this.currentTranslateX = -clickOffsetX * (zoomRatio - 1);
            this.currentTranslateY = -clickOffsetY * (zoomRatio - 1);
            
            this.updateImageTransform();
            
            this.isZoomedTo75 = true;
        }
        
        this.updateZoomPercentage();
    }

    applyBoundaries() {
        const rect = this.popupImage.getBoundingClientRect();
        const imageWidth = rect.width;
        const imageHeight = rect.height;
        const containerWidth = this.overlayElement.clientWidth;
        const containerHeight = this.overlayElement.clientHeight;

        const maxX = (imageWidth - containerWidth) / 2;
        const maxY = (imageHeight - containerHeight) / 2;

        this.currentTranslateX = Math.min(maxX, Math.max(-maxX, this.currentTranslateX));
        this.currentTranslateY = Math.min(maxY, Math.max(-maxY, this.currentTranslateY));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Zoomable();
});