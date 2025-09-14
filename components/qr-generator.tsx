"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import QRCode from "qrcode"
import { useTheme } from "next-themes"

interface QRGeneratorProps {
  data: string // The primary data for the QR code (e.g., baseSecret + frameKey)
  size?: number // Size of the QR code
  iconSize?: number // Size of the central icon
  icon?: React.ElementType // Optional custom icon component
  animationDelay?: number // Delay for cycling through animated images in ms
}

// Define your animation images here
// For demonstration, I'm using placeholder base64 images (small, simple shapes).
// In a real application, you might import actual image files or use SVG strings.
const animatedImages = [
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PGNpcmNsZSBjeD0iOCIgY3k9CI4IiByPSI3IiBmaWxsPSIjRjBBMUQ4Ii8+PC9zdmc+", // Pink Circle
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjNDhBN0YwIi8+PC9zdmc+", // Blue Square
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBvbHlnb24gcG9pbnRzPSI4LDAgMTYsMTYgMCwxNiIgZmlsbD0iI0ZGQTUxOSIvPjwvc3ZnPg==", // Orange Triangle
]

export const QRGenerator: React.FC<QRGeneratorProps> = ({
  data,
  size = 256,
  iconSize = 40,
  icon: CustomIcon,
  animationDelay = 500, // New prop for animation speed
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const [currentImageIndex, setCurrentImageIndex] = useState(0) // State for animated image index

  const drawQR = useCallback(async () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    const qrColor = theme === "dark" ? "#ffffff" : "#000000"
    const bgColor = theme === "dark" ? "#000000" : "#ffffff"

    try {
      // 1. Generate the QR code onto the canvas
      await QRCode.toCanvas(canvas, data, {
        width: size,
        errorCorrectionLevel: "H", // High error correction to allow for overlay
        color: {
          dark: qrColor,
          light: bgColor,
        },
      })

      // 2. Draw the animated image in the center
      const img = new Image()
      img.src = animatedImages[currentImageIndex]
      img.onload = () => {
        const x = (size - iconSize) / 2
        const y = (size - iconSize) / 2
        ctx.drawImage(img, x, y, iconSize, iconSize)
      }
      img.onerror = (err) => {
        console.error("Failed to load animated image:", err)
      }

      // If you still want the CustomIcon to overlay the animated image, draw it here
      // This might make the animation less noticeable depending on icon size
      if (CustomIcon) {
        // You'd need a way to render React components to canvas,
        // which is non-trivial. For simplicity, if CustomIcon is used,
        // it usually means a static icon. If you want a truly animated icon,
        // you'd pass a sequence of icon components or an SVG string.
        // For now, let's assume CustomIcon is a simple, non-animated element
        // or we omit it if animatedImages are preferred.
        // If CustomIcon is *also* desired, you might render it outside the canvas
        // or find a way to draw its SVG equivalent.
      }
    } catch (err) {
      console.error("Error generating QR code:", err)
    }
  }, [data, size, iconSize, theme, currentImageIndex, CustomIcon]) // Include currentImageIndex in dependencies

  // Effect to re-draw QR code when data or theme changes, or animated image updates
  useEffect(() => {
    drawQR()
  }, [drawQR])

  // Effect to animate the central image
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % animatedImages.length
      )
    }, animationDelay)

    return () => clearInterval(interval) // Cleanup on unmount
  }, [animationDelay])

  return (
    <div
      className="relative flex items-center justify-center p-2 rounded-lg bg-background border"
      style={{ width: size + 4, height: size + 4 }} // Account for padding
    >
      <canvas ref={canvasRef} width={size} height={size} />
      {/* If you want a static icon on top, you could place it here
          as a separate absolutely positioned element, but drawing it
          directly on canvas ensures it's part of the QR code image. */}
    </div>
  )
}