function Mouse() {
    this.canvasMousePosition = new THREE.Vector2();
    this.absoluteDocumentMousePosition = new THREE.Vector2();

    this.updateMousePosition = function (event, domElement) {
        const rect = domElement.getBoundingClientRect();
        if (rect.width - rect.left != 0) {
            this.canvasMousePosition.x = ((event.clientX - rect.left) / (rect.right - rect.left)) * 2 - 1;
        } else {
            this.canvasMousePosition.x = -1;
        }
        if (rect.bottom - rect.top != 0) {
            this.canvasMousePosition.y = -((event.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1;
        } else {
            this.canvasMousePosition.y = 1;
        }
        this.absoluteDocumentMousePosition.x = event.clientX;
        this.absoluteDocumentMousePosition.y = event.clientY;
    }
}
