export class ToastStore {
  private innerMessage = $state<string | null>(null);
  private timer: ReturnType<typeof setTimeout> | null = null;

  get message(): string | null {
    return this.innerMessage;
  }

  show(text: string, durationMs = 2000): void {
    this.innerMessage = text;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.innerMessage = null;
      this.timer = null;
    }, durationMs);
  }

  dismiss(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.innerMessage = null;
  }
}

export const toast = new ToastStore();
