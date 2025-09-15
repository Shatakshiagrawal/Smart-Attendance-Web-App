"use client"

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface AnimatedQrDisplayProps {
  data: string;
  size?: number;
}

const qrColorPalette = {
    dark: '#000000',
    light: '#FFFFFF',
};

export function AnimatedQrDisplay({ data, size = 280 }: AnimatedQrDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the container div

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

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
    }).then(() => {
        // FIX: Add a class to trigger the animation, then remove it
        container.classList.add('animate-qr-pulse');
        setTimeout(() => {
            container.classList.remove('animate-qr-pulse');
        }, 300); // Duration should match the animation
    }).catch(err => {
      console.error("Failed to generate QR Code:", err);
    });

  }, [data, size]);

  return (
    <div 
        ref={containerRef} // Add ref to the container
        className="relative p-2 bg-white rounded-2xl shadow-lg transition-opacity duration-300"
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