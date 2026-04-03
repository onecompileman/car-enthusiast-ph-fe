import { Injectable } from '@angular/core';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

@Injectable({ providedIn: 'root' })
export class ImageFilterService {
  private model: cocoSsd.ObjectDetection | null = null;

  constructor() {}

  async isCarPhotoAsync(file: File): Promise<boolean> {
    await this.loadModel();

    const confidenceThreshold = 0.5;

    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    await new Promise((resolve) => (img.onload = resolve));

    const predictions = await this.model?.detect(img);

    const car = predictions?.find((p) => p.class === 'car');

    URL.revokeObjectURL(img.src);

    return Boolean(car) && (car?.score || 0) > confidenceThreshold;
  }

  async loadModel(): Promise<void> {
    if (this.model) {
      return Promise.resolve();
    }

    try {
      await tf.setBackend('webgl'); // Try WebGL first
    } catch {
      console.warn('WebGL not available, falling back to CPU');
      await tf.setBackend('cpu');
    }
    await tf.ready();
    return cocoSsd.load().then((model) => {
      this.model = model;
    });
  }
}
