import React, { useEffect, useState, useRef } from "react";
import { Network, Loader2 } from "lucide-react";

interface BnglVisualizerSectionProps {
  biomodelId: string;
}

export const BnglVisualizerSection: React.FC<BnglVisualizerSectionProps> = ({
  biomodelId,
}) => {
  const [bnglData, setBnglData] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const fetchBnglData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/biomodel/${biomodelId}/biomodel.bngl`);

        if (res.ok) {
          const data = await res.json();
          if (data.data && data.data.trim()) {
            setBnglData(data.data);
            setIsVisible(true);
          } else {
            // Model is not rule-based, don't show the section
            setIsVisible(false);
          }
        } else {
          // Error fetching, don't show the section
          setIsVisible(false);
        }
      } catch (err) {
        // Error fetching, don't show the section
        setIsVisible(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (biomodelId) {
      fetchBnglData();
    }
  }, [biomodelId]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'bnglviz-ready' && bnglData && iframeRef.current) {
        // Send BNGL data to iframe
        iframeRef.current.contentWindow?.postMessage(bnglData, '*');
      }
    };

    if (isVisible && bnglData) {
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [bnglData, isVisible]);

  // Don't render anything if loading, error, or not visible
  if (isLoading || error || !isVisible || !bnglData) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Network className="h-4 w-4" />
          BNGL Visualization
        </h3>
      </div>
      <div className="p-4">
        <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
          <iframe
            ref={iframeRef}
            src="/bnglviz/index.html"
            className="w-full h-[600px] border-0"
            title="BNGL Visualization"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
};