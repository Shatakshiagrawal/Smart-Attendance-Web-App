"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Loader2, CameraOff } from "lucide-react"
import { Html5Qrcode } from "html5-qrcode"
import toast, { Toaster } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/AuthProvider.jsx"

export default function QRScannerPage() {
  const router = useRouter();
  const { handleApiError } = useAuth();
  const [scanStatus, setScanStatus] = useState<"idle" | "capturing" | "verifying" | "success" | "error">("idle");
  const [error, setError] = useState("");
  
  // State for UI updates
  const [progress, setProgress] = useState(0);
  const [chunksCollectedCount, setChunksCollectedCount] = useState(0);
  const [totalChunksCount, setTotalChunksCount] = useState(0);
  
  // Refs for stable data access within the scanner callback
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const collectedChunksRef = useRef<Map<number, string>>(new Map());
  const currentSessionIdRef = useRef<string | null>(null);

  const verifyAttendance = async (id: string, assembledSequence: string[]) => {
    setScanStatus("verifying");
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/attendance/mark`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({ attendanceId: id, assembledSequence }),
      });
      
      const data = await response.json();

      if (response.ok) {
        setScanStatus("success");
        toast.success(data.message || "Attendance marked successfully!");
        setTimeout(() => router.push("/student/dashboard"), 2000);
      } else {
        if (response.status === 422 || response.status === 409) {
          setError(data.message);
          setScanStatus("error");
          toast.error(data.message);
        } else if (response.status === 401 || response.status === 403) {
          handleApiError(response);
        } else {
          throw new Error(data.message || "An unknown error occurred.");
        }
      }
    } catch (err) {
      setError((err as Error).message);
      setScanStatus("error");
    }
  };
  
  useEffect(() => {
    // Ensure this runs only once
    if (scannerRef.current) return;

    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    const onScanSuccess = (decodedText: string) => {
      try {
        const [id, totalStr, indexStr, data] = decodedText.split('|');
        if (!id || !totalStr || !indexStr || !data) return;

        const chunkIndex = parseInt(indexStr, 10);
        const totalChunksNeeded = parseInt(totalStr, 10);

        // --- THE CRITICAL FIX ---
        // Use refs to access the latest state within the callback
        const currentSessionId = currentSessionIdRef.current;
        const collectedChunks = collectedChunksRef.current;

        // If the session ID changes, reset everything
        if (currentSessionId && id !== currentSessionId) {
          toast.error("QR Code changed. Restarting scan...");
          collectedChunks.clear();
          currentSessionIdRef.current = id;
          setChunksCollectedCount(0);
          setTotalChunksCount(totalChunksNeeded);
        }

        // Lock onto the first session ID scanned
        if (!currentSessionId) {
          currentSessionIdRef.current = id;
          setTotalChunksCount(totalChunksNeeded);
        }

        // Collect new chunks only for the current session
        if (id === currentSessionIdRef.current && !collectedChunks.has(chunkIndex)) {
            collectedChunks.set(chunkIndex, data);
            setChunksCollectedCount(collectedChunks.size);
            setProgress((collectedChunks.size / totalChunksNeeded) * 100);

            // If all chunks are collected, stop the scanner and verify
            if (collectedChunks.size === totalChunksNeeded) {
                if (html5QrCode && html5QrCode.isScanning) {
                    html5QrCode.stop().then(() => {
                        const assembled = Array.from({ length: totalChunksNeeded }, (_, i) => collectedChunks.get(i)!)
                        verifyAttendance(id, assembled);
                    }).catch(console.error);
                }
            }
        }
      } catch(e) { /* ignore malformed QR codes */ }
    };

    const startScanner = () => {
        setScanStatus("capturing");
        Html5Qrcode.getCameras().then(devices => {
            if (devices && devices.length) {
                html5QrCode.start(
                    { facingMode: "environment" }, 
                    { fps: 10, qrbox: { width: 250, height: 350 } },
                    onScanSuccess,
                    (errorMessage) => {}
                ).catch(err => {
                    setError("Failed to start scanner. Please grant camera permissions.");
                    setScanStatus("error");
                });
            }
        }).catch(err => {
            setError("Could not get camera devices. Please grant camera permissions.");
            setScanStatus("error");
        });
    }

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  const renderContent = () => {
    switch (scanStatus) {
      case "capturing":
        return (
            <div className="text-center flex flex-col items-center gap-3 w-full">
                <p className="text-muted-foreground mt-2">Scanning...</p>
                <Progress value={progress} className="w-full" />
                <p className="text-sm font-bold">{chunksCollectedCount} of {totalChunksCount || '?'} chunks found</p>
            </div>
        );
      case "verifying": return <div className="text-center flex flex-col items-center gap-2"><Loader2 className="animate-spin w-12 h-12" /> Verifying...</div>;
      case "success": return <div className="text-center flex flex-col items-center gap-2"><CheckCircle className="text-green-500 w-12 h-12" /> Attendance Marked!</div>;
      case "error":
        return (
          <div className="text-center">
            <XCircle className="text-red-500 w-12 h-12 mx-auto mb-2" />
            <Alert variant="destructive" className="mt-4"><AlertDescription>{error}</AlertDescription></Alert>
            <Button onClick={() => router.push("/student/dashboard")} className="mt-4">Back to Dashboard</Button>
          </div>
        );
      default: return <div className="text-center text-muted-foreground"><CameraOff/> Waiting to start...</div>;
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">QR Scanner</h1>
          <p className="text-muted-foreground mt-1">Point your camera at the QR code to mark your attendance</p>
        </div>
      </div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="border-border/50">
            <CardContent className="p-4 sm:p-6">
                <div id="reader" className="w-full max-w-md mx-auto bg-black rounded-lg overflow-hidden"></div>
                <div className="min-h-[120px] flex items-center justify-center p-4 max-w-md mx-auto">
                    {renderContent()}
                </div>
            </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}