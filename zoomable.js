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

        const zoomMin = this.popupImage?.dataset.zoomMin || 1;
        const zoomMax = this.popupImage?.dataset.zoomMax || 6;

        this.zoomLevelsKeyboard = [1, 2, 3, 4, 5, 6];
        this.zoomLevelsTouchpad = [1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.4, 2.6, 2.8, 3, 3.2, 3.4, 3.6, 3.8, 4, 4.2, 4.4, 4.6, 4.8, 5, 5.2, 5.4, 5.6, 5.8, 6];
        this.zoomIndexKeyboard = 0;
        this.zoomIndexTouchpad = 0;
        this.zoomLimits = { min: parseFloat(zoomMin), max: parseFloat(zoomMax) };

        // Variables para el desplazamiento de la imagen
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.translateX = 0;
        this.translateY = 0;
        this.currentTranslateX = 0;
        this.currentTranslateY = 0;

        // Variable para rastrear el estado de zoom al 75%
        this.isZoomedTo75 = false;

        if (this.triggerElement && this.overlayElement && this.popupImage) {
            this.init();
        }
    }

    init() {
        this.triggerElement.addEventListener('click', () => this.openPopup());

        this.overlayElement.addEventListener('click', (event) => {
            if (!event.target.matches('[data-zoom-image]')) {
                this.closePopup();
            }
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

        // Eventos para el arrastre de la imagen
        this.popupImage.addEventListener('mousedown', (event) => this.handleDragStart(event));
        window.addEventListener('mousemove', (event) => this.handleDragMove(event));
        window.addEventListener('mouseup', () => this.handleDragEnd());

        // Eventos de arrastre para dispositivos tactiles
        this.popupImage.addEventListener('touchstart', (event) => this.handleDragTouchStart(event), { passive: false });
        window.addEventListener('touchmove', (event) => this.handleDragTouchMove(event), { passive: false });
        window.addEventListener('touchend', () => this.handleDragEnd());
        
        // Evento para doble click que activa el zoom al 75%
        this.popupImage.addEventListener('dblclick', (event) => this.handleDoubleClick(event));
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

    handleDragMove(event) {
        if (this.isDragging) {
            const x = event.clientX - this.startX;
            const y = event.clientY - this.startY;
            
            // Cálculo de nuevas coordenadas
            this.currentTranslateX = this.translateX + x;
            this.currentTranslateY = this.translateY + y;
            
            // Aplicar la transformación
            this.updateImageTransform();
        }
    }

    handleDragEnd() {
        if (this.isDragging) {
            this.isDragging = false;
            this.popupImage.classList.remove('dragging');
        }
    }

    handleDragTouchStart(event) {
        if (event.touches.length === 2) {
            // Iniciar el arrastre con dos dedos
            this.isDragging = true;
            this.popupImage.classList.add('dragging');
            this.startX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
            this.startY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
            this.translateX = this.currentTranslateX;
            this.translateY = this.currentTranslateY;
            event.preventDefault();
        }
    }

    handleDragTouchMove(event) {
        if (this.isDragging && event.touches.length === 2) {
            const currentX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
            const currentY = (event.touches[0].clientY + event.touches[1].clientY) / 2;

            // Cálculo de la diferencia entre la posición anterior y la nueva
            const dx = currentX - this.startX;
            const dy = currentY - this.startY;

            // Actualizamos las posiciones actuales de la imagen
            this.currentTranslateX = this.translateX + dx;
            this.currentTranslateY = this.translateY + dy;

            // Aplicar la transformación
            this.updateImageTransform();

            // Actualizar las coordenadas iniciales para el siguiente movimiento
            this.startX = currentX;
            this.startY = currentY;

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

    handleZoom(direction, inputType) {
        let newIndex;
        let currentZoom = this.getCurrentZoomLevel();
        let newZoom;

        if (inputType === 'keyboard') {
            newIndex = this.zoomIndexKeyboard + direction;
            if (newIndex >= 0 && newIndex < this.zoomLevelsKeyboard.length) {
                this.zoomIndexKeyboard = newIndex;
                newZoom = this.zoomLevelsKeyboard[this.zoomIndexKeyboard];
                
                // Si estamos haciendo zoom out, ajustamos la posición
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
                
                // Si estamos haciendo zoom out, ajustamos la posición
                if (direction < 0) {
                    this.adjustPositionOnZoomOut(currentZoom, newZoom);
                }
                
                this.updateImageTransform();
            }
        }
    }
    
    adjustPositionOnZoomOut(currentZoom, newZoom) {
        // Calcular el factor de reducción de zoom
        const zoomRatio = newZoom / currentZoom;
        
        // Ajustar las coordenadas de traslación proporcionalmente al cambio de zoom
        this.currentTranslateX = this.currentTranslateX * zoomRatio;
        this.currentTranslateY = this.currentTranslateY * zoomRatio;
        
        // Si el zoom es 1 (o muy cercano), resetear completamente la posición
        if (newZoom <= 1.05) {
            this.currentTranslateX = 0;
            this.currentTranslateY = 0;
        }
    }
    
    getCurrentZoomLevel() {
        // Obtenemos el nivel actual de zoom según el último usado
        return this.zoomIndexTouchpad > 0 
            ? this.zoomLevelsTouchpad[this.zoomIndexTouchpad] 
            : this.zoomLevelsKeyboard[this.zoomIndexKeyboard];
    }
    
    updateImageTransform() {
        // Aplicamos tanto el zoom como la traslación
        const zoomLevel = this.getCurrentZoomLevel();
        this.popupImage.style.transform = `scale(${zoomLevel}) translate(${this.currentTranslateX / zoomLevel}px, ${this.currentTranslateY / zoomLevel}px)`;
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
        this.currentTranslateX = 0;
        this.currentTranslateY = 0;
        this.popupImage.style.transform = 'scale(1)';
        this.isZoomedTo75 = false;
    }
    
    // Nueva función para manejar el doble clic y zoom al 75% centrado en el punto de clic
    handleDoubleClick(event) {
        event.preventDefault();
        
        if (this.isZoomedTo75) {
            // Si ya está ampliado al 75%, restablecer al tamaño original
            this.resetZoom();
        } else {
            // Calcular el nivel de zoom al 75% del máximo disponible
            const maxZoom = this.zoomLimits.max;
            const targetZoom = maxZoom * 0.75;
            
            // Encontrar qué índice corresponde al zoom objetivo en nuestras matrices de zoom
            // Primero intentamos encontrarlo en los niveles de teclado (que son más discretos)
            let targetIndex = this.zoomLevelsKeyboard.findIndex(level => level >= targetZoom);
            let zoomArray = this.zoomLevelsKeyboard;
            let zoomIndexProp = 'zoomIndexKeyboard';
            
            // Si no lo encontramos o si el zoom va a ser más preciso con los niveles de touchpad
            if (targetIndex === -1 || 
                (this.zoomLevelsTouchpad.some(level => Math.abs(level - targetZoom) < Math.abs(this.zoomLevelsKeyboard[targetIndex] - targetZoom)))) {
                targetIndex = this.zoomLevelsTouchpad.findIndex(level => level >= targetZoom);
                zoomArray = this.zoomLevelsTouchpad;
                zoomIndexProp = 'zoomIndexTouchpad';
                
                // Si aún no lo encontramos, tomamos el último nivel (el más alto)
                if (targetIndex === -1) {
                    targetIndex = this.zoomLevelsTouchpad.length - 1;
                }
            }
            
            // Guardar el nivel de zoom actual para calcular el ratio de zoom
            const currentZoom = this.getCurrentZoomLevel();
            
            // Actualizar el índice de zoom
            this[zoomIndexProp] = targetIndex;
            const newZoom = zoomArray[targetIndex];
            
            // Calcular las coordenadas del punto de clic relativas a la imagen
            const rect = this.popupImage.getBoundingClientRect();
            
            // Calcular el centro de la imagen
            const imageCenterX = rect.left + rect.width / 2;
            const imageCenterY = rect.top + rect.height / 2;
            
            // Calcular la diferencia entre el punto de clic y el centro de la imagen
            const clickOffsetX = event.clientX - imageCenterX;
            const clickOffsetY = event.clientY - imageCenterY;
            
            // Calcular el factor de escala entre el zoom actual y el nuevo zoom
            const zoomRatio = newZoom / currentZoom;
            
            // Calcular la nueva posición de manera que el punto de clic esté centrado
            // después del zoom
            this.currentTranslateX = -clickOffsetX * (zoomRatio - 1);
            this.currentTranslateY = -clickOffsetY * (zoomRatio - 1);
            
            // Aplicar el zoom y la traslación
            this.updateImageTransform();
            
            // Marcar que la imagen está ampliada al 75%
            this.isZoomedTo75 = true;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Zoomable();
});