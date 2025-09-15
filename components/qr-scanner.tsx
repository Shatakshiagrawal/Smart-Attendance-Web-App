"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Loader2, CameraOff, QrCode } from "lucide-react"
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode"
import toast, { Toaster } from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function QRScannerPage() {
  const router = useRouter();
  const [scanStatus, setScanStatus] = useState<"idle" | "capturing" | "verifying" | "success" | "error">("idle");
  const [error, setError] = useState("");
  
  const [totalChunks, setTotalChunks] = useState(0);
  const [collectedChunks, setCollectedChunks] = useState<Map<number, string>>(new Map());

  const resetState = useCallback(() => {
    setScanStatus("idle");
    setError("");
    setTotalChunks(0);
    setCollectedChunks(new Map());
  }, []);
  
  const verifyAttendance = async (id: string, assembledSequence: string[]) => {
    setScanStatus("verifying");
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("/api/attendance/mark", {
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
        throw new Error(data.message || "Failed to mark attendance");
      }
    } catch (err) {
      setError((err as Error).message);
      setScanStatus("error");
    }
  };

  useEffect(() => {
    resetState();
    setScanStatus("capturing");

    const scanner = new Html5Qrcode("reader");

    const onScanSuccess = (decodedText: string) => {
      try {
        const [id, total, index, data] = decodedText.split('|');
        const chunkIndex = parseInt(index, 10);
        const totalChunksNeeded = parseInt(total, 10);

        if (id && data && !isNaN(chunkIndex) && !isNaN(totalChunksNeeded)) {
            setCollectedChunks(currentChunks => {
                if (currentChunks.has(chunkIndex)) return currentChunks;
                const newChunks = new Map(currentChunks).set(chunkIndex, data);
                
                if (newChunks.size === totalChunksNeeded) {
                    scanner.clear().catch(err => console.error("Failed to clear scanner", err));
                    const assembled = Array.from(newChunks.keys()).sort((a, b) => a - b).map(key => newChunks.get(key)!);
                    verifyAttendance(id, assembled);
                }
                return newChunks;
            });

            if (totalChunks === 0) setTotalChunks(totalChunksNeeded);
        }
      } catch(e) { /* ignore */ }
    };

    const onScanFailure = (error: any) => {
      // This is called frequently, so we don't want to log anything here.
    };

    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length) {
          scanner.start(
              { facingMode: "environment" }, 
              {
                  fps: 10,
                  qrbox: { width: 250, height: 350 } 
              },
              onScanSuccess,
              onScanFailure
          ).catch(err => {
              setError("Failed to start scanner. Please grant camera permissions.");
              setScanStatus("error");
          });
      }
    }).catch(err => {
      setError("Could not get camera devices. Please grant camera permissions.");
      setScanStatus("error");
    });

    return () => {
      scanner.clear().catch(err => console.error("Failed to clear scanner on unmount", err));
    };
  }, []);

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
                <div id="reader" className="w-full max-w-md mx-auto aspect-square bg-black rounded-lg overflow-hidden"></div>
                <div className="min-h-[120px] flex items-center justify-center p-4 max-w-md mx-auto">
                    {renderContent()}
                </div>
            </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}