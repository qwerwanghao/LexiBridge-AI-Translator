interface PopupPosition {
  x: number;
  y: number;
}

export class TranslationPopup {
  private container: HTMLDivElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'lexibridge-selection-popup';
    this.container.style.setProperty('position', 'fixed', 'important');
    this.container.style.setProperty('z-index', '2147483647', 'important');
    this.container.style.setProperty('max-width', '420px', 'important');
    this.container.style.setProperty('padding', '14px 16px', 'important');
    this.container.style.setProperty('border-radius', '10px', 'important');
    this.container.style.setProperty('border', '1px solid #facc15', 'important');
    this.container.style.setProperty('background', '#0b0b0b', 'important');
    this.container.style.setProperty('color', '#fde047', 'important');
    this.container.style.setProperty('box-shadow', '0 14px 30px rgba(0, 0, 0, 0.55)', 'important');
    this.container.style.setProperty('font-size', '18px', 'important');
    this.container.style.setProperty('font-weight', '600', 'important');
    this.container.style.setProperty('line-height', '1.55', 'important');
    this.container.style.setProperty('letter-spacing', '0', 'important');
    this.container.style.setProperty('white-space', 'pre-wrap', 'important');
    this.container.style.setProperty('word-break', 'break-word', 'important');
    this.container.style.setProperty('text-shadow', 'none', 'important');
    this.container.style.setProperty('opacity', '1', 'important');
    this.container.style.setProperty('display', 'none', 'important');
    document.body.appendChild(this.container);
  }

  show(content: string, position: PopupPosition): void {
    this.container.textContent = content;
    this.container.style.left = `${position.x}px`;
    this.container.style.top = `${position.y}px`;
    this.container.style.display = 'block';
  }

  hide(): void {
    this.container.style.display = 'none';
  }
}
