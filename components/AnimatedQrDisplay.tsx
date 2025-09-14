"use client"

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface AnimatedQrDisplayProps {
  data: string;
  size?: number;
}

// FIX: A high-contrast, black-and-white color palette for maximum scannability.
const qrColorPalette = {
    dark: '#000000', // Black for the QR code modules
    light: '#FFFFFF', // White for the background
};

export function AnimatedQrDisplay({ data, size = 280 }: AnimatedQrDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!data) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    QRCode.toCanvas(canvas, data, {
      width: size,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: qrColorPalette.dark,
        light: qrColorPalette.light,
      },
    }).catch(err => {
      console.error("Failed to generate QR Code:", err);
    });

  }, [data, size]);

  return (
    <div 
        className="relative p-2 bg-white rounded-2xl shadow-lg"
        style={{ width: size + 16, height: size + 16 }}
    >
      <canvas 
        ref={canvasRef} 
        width={size} 
        height={size}
        className="rounded-lg"
      />
    </div>
  );
}