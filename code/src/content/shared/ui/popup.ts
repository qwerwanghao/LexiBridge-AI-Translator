interface PopupPosition {
  x: number;
  y: number;
}

export class TranslationPopup {
  private container: HTMLDivElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.style.position = 'fixed';
    this.container.style.zIndex = '2147483647';
    this.container.style.maxWidth = '360px';
    this.container.style.padding = '10px';
    this.container.style.borderRadius = '8px';
    this.container.style.border = '1px solid #cbd5e1';
    this.container.style.background = '#ffffff';
    this.container.style.boxShadow = '0 10px 24px rgba(15, 23, 42, 0.15)';
    this.container.style.fontSize = '13px';
    this.container.style.lineHeight = '1.4';
    this.container.style.display = 'none';
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
