import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { X } from "lucide-react";
import TradeShareCard from "../pages/TradeShareCard";

export default function ShareTradeModal({ trade, username, onClose }: any) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    generateImage();
  }, []);

  const generateImage = async () => {
    if (!cardRef.current) return;

    try {
      const dataUrl = await toPng(cardRef.current);
      setImage(dataUrl);
    } catch {
      console.error("Failed to generate image");
    }
  };

  const downloadImage = () => {
    if (!image) return;

    const link = document.createElement("a");
    link.download = `${trade.symbol}-trade.png`;
    link.href = image;
    link.click();
  };

  const copyImage = async () => {
    if (!image) return;

    const blob = await (await fetch(image)).blob();
    const item = new ClipboardItem({ "image/png": blob });

    await navigator.clipboard.write([item]);
  };

  return (
    <>
      {/* BACKDROP */}
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">

        {/* MODAL */}
        <div className="bg-white dark:bg-black w-[500px] rounded-xl p-6 relative border border-gray-200 dark:border-gray-800">

          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Share Trade
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            Your trade image is ready to share or download.
          </p>

          {/* LOADING */}
          {!image && (
            <div className="flex flex-col items-center gap-3 py-10">
              <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
              <p className="text-sm text-gray-500">
                Generating trade image...
              </p>
            </div>
          )}

          {/* IMAGE PREVIEW */}
          {image && (
            <img
              src={image}
              alt="Trade share card"
              className="rounded-lg mb-6 border border-gray-200 dark:border-gray-800 w-full"
            />
          )}

          {/* BUTTONS */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={copyImage}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Copy Image
            </button>

            <button
              onClick={downloadImage}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              Download Image
            </button>
          </div>

          {/* Hidden Share Card */}
          <div className="absolute -left-[9999px]">
            <div ref={cardRef}>
              <TradeShareCard trade={trade} username={username} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

