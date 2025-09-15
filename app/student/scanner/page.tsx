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
  
  const [totalChunks, setTotalChunks] = useState(0);
  const [collectedChunks, setCollectedChunks] = useState<Map<number, string>>(new Map());
  // FIX: State to track the current session ID
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);

  const resetState = useCallback(() => {
    setScanStatus("capturing"); // Go back to capturing state
    setError("");
    setTotalChunks(0);
    setCollectedChunks(new Map());
    setCurrentSessionId(null);
  }, []);
  
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
        // FIX: Handle specific 422 error without logging out
        if (response.status === 422 || response.status === 409) {
          setError(data.message);
          setScanStatus("error");
          toast.error(data.message);
        } else if (response.status === 401 || response.status === 403) {
          handleApiError(response); // This handles actual auth errors
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
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    const startScanner = () => {
        Html5Qrcode.getCameras().then(devices => {
            if (devices && devices.length) {
                html5QrCode.start(
                    { facingMode: "environment" }, 
                    { fps: 10, qrbox: { width: 250, height: 350 } },
                    onScanSuccess,
                    (errorMessage) => {} // onScanFailure
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

    const onScanSuccess = (decodedText: string) => {
      try {
        const [id, total, index, data] = decodedText.split('|');
        if (!id || !total || !index || !data) return; // Ignore invalid QR codes

        const chunkIndex = parseInt(index, 10);
        const totalChunksNeeded = parseInt(total, 10);

        // FIX: Core logic to prevent mixing chunks from different sessions
        if (currentSessionId && id !== currentSessionId) {
            toast.error("QR Code changed. Restarting scan...");
            setCollectedChunks(new Map());
            setTotalChunks(totalChunksNeeded);
            setCurrentSessionId(id);
        }

        if (!currentSessionId) {
            setCurrentSessionId(id);
            setTotalChunks(totalChunksNeeded);
        }
        
        setCollectedChunks(currentChunks => {
            if (currentChunks.has(chunkIndex)) return currentChunks;
            const newChunks = new Map(currentChunks).set(chunkIndex, data);
            
            if (newChunks.size === totalChunksNeeded) {
                if (html5QrCode && html5QrCode.isScanning) {
                    html5QrCode.stop().then(() => {
                        const assembled = Array.from({ length: totalChunksNeeded }, (_, i) => newChunks.get(i)!)
                        verifyAttendance(id, assembled);
                    }).catch(console.error);
                }
            }
            return newChunks;
        });

      } catch(e) { /* ignore malformed QR codes */ }
    };

    resetState();
    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => {
            console.error("Failed to clear scanner on unmount", err)
        });
      }
    };
  }, []); // Only run once on mount

  const renderContent = () => {
    const progress = totalChunks > 0 ? (collectedChunks.size / totalChunks) * 100 : 0;
    switch (scanStatus) {
      case "capturing":
        return (
            <div className="text-center flex flex-col items-center gap-3 w-full">
                <p className="text-muted-foreground mt-2">Scanning...</p>
                <Progress value={progress} className="w-full" />
                <p className="text-sm font-bold">{collectedChunks.size} of {totalChunks || '?'} chunks found</p>
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