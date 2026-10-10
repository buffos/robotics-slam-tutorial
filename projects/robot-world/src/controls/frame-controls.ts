/** Presentation choices, separate from physical drive commands and robot state. */
export interface FrameInspection {
  readonly landmarkId: string;
  readonly axesVisible: boolean;
}

/** Sample native selection controls; listeners and an input state store are unnecessary. */
export class FrameControls {
  constructor(
    private readonly landmarkSelect: HTMLSelectElement,
    private readonly axesToggle: HTMLInputElement,
  ) {}

  read(): FrameInspection {
    // Sampling gives keyboard, pointer, and assistive input the same behavior.
    return {
      landmarkId: this.landmarkSelect.value,
      axesVisible: this.axesToggle.checked,
    };
  }
}
