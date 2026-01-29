class DragHandler {
  constructor(button) {
    this.button = button;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.startPos = { x: 0, y: 0 };
    this.mouseMoveHandler = null;
    this.mouseUpHandler = null;
    
    this.initializeDragging();
  }
  
  initializeDragging() {
    this.button.onmousedown = (e) => this.handleMouseDown(e);
  }
  
  handleMouseDown(e) {
    this.isDragging = false;
    this.startPos = { x: e.clientX, y: e.clientY };
    const rect = this.button.getBoundingClientRect();
    this.dragOffset.x = e.clientX - rect.left;
    this.dragOffset.y = e.clientY - rect.top;
    
    this.button.style.cursor = "grabbing";
    this.button.style.transform = "scale(1.1)";
    this.button.isDragging = false;
    
    e.preventDefault();
    e.stopPropagation();

    this.setupEventListeners();
  }
  
  setupEventListeners() {
    this.mouseMoveHandler = (moveEvent) => this.handleMouseMove(moveEvent);
    this.mouseUpHandler = (upEvent) => this.handleMouseUp(upEvent);
    
    document.addEventListener('mousemove', this.mouseMoveHandler);
    document.addEventListener('mouseup', this.mouseUpHandler);
  }
  
  handleMouseMove(moveEvent) {
    if (this.startPos.x !== 0 && this.startPos.y !== 0) {
      const distance = Math.sqrt(
        Math.pow(moveEvent.clientX - this.startPos.x, 2) + 
        Math.pow(moveEvent.clientY - this.startPos.y, 2)
      );
      
      if (distance > 5 && !this.isDragging) {
        this.startDragging();
      }
      
      if (this.isDragging) {
        this.updatePosition(moveEvent);
      }
    }
  }
  
  startDragging() {
    this.isDragging = true;
    this.button.isDragging = true;
    
    const currentRect = this.button.getBoundingClientRect();
    this.button.style.position = "fixed";
    this.button.style.left = currentRect.left + "px";
    this.button.style.top = currentRect.top + "px";
    this.button.style.bottom = "auto";
    this.button.style.right = "auto";
    this.button.style.zIndex = "99999";
  }
  
  updatePosition(moveEvent) {
    this.button.style.left = (moveEvent.clientX - this.dragOffset.x) + "px";
    this.button.style.top = (moveEvent.clientY - this.dragOffset.y) + "px";
  }
  
  handleMouseUp(upEvent) {
    this.button.style.cursor = "move";
    this.button.style.transform = "scale(1)";
    
    const wasDragging = this.isDragging;
    
    if (wasDragging) {
      this.button.style.zIndex = "10000";
    } else {
      this.button.dispatchEvent(new CustomEvent('aiButtonClick', { 
        detail: { originalEvent: upEvent }
      }));
    }
    
    this.cleanup();
  }
  
  cleanup() {
    document.removeEventListener('mousemove', this.mouseMoveHandler);
    document.removeEventListener('mouseup', this.mouseUpHandler);
    
    this.startPos = { x: 0, y: 0 };
    this.isDragging = false;
    this.button.isDragging = false;
    this.mouseMoveHandler = null;
    this.mouseUpHandler = null;
  }
}