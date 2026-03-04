import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Opening your journal");

  // Simulate loading progress for better UX
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + (90 - prev) * 0.1; // Easing effect
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [loading]);

  // Rotating loading messages
  useEffect(() => {
    if (loading) {
      const messages = [
        "Opening your journal",
        "Gathering your thoughts",
        "Turning pages...",
        "Almost there",
        "Preparing your space"
      ];
      
      let index = 0;
      const interval = setInterval(() => {
        index = (index + 1) % messages.length;
        setLoadingMessage(messages[index]);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 flex items-center justify-center">
        <div className="max-w-md w-full px-6 py-12">
          {/* Main loading container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-amber-100">
            <div className="text-center space-y-8">
              
              {/* Animated journal with page flip effect */}
              <div className="relative h-32 flex items-center justify-center">
                {/* Book background */}
                <div className="absolute w-24 h-28 bg-amber-800 rounded-lg shadow-2xl transform -rotate-3" />
                <div className="absolute w-24 h-28 bg-amber-700 rounded-lg shadow-xl transform rotate-3" />
                
                {/* Main book */}
                <div className="relative w-24 h-28 bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg shadow-2xl flex items-center justify-center overflow-hidden">
                  {/* Book spine */}
                  <div className="absolute left-2 top-2 bottom-2 w-1 bg-amber-400/30 rounded-full" />
                  
                  {/* Pages */}
                  <div className="relative w-full h-full">
                    <div className="absolute inset-2 bg-white/95 rounded transform origin-left animate-[pageFlip_2s_ease-in-out_infinite]" />
                    <div className="absolute inset-2 bg-white/95 rounded transform origin-left animate-[pageFlip_2s_ease-in-out_infinite_0.4s]" />
                    <div className="absolute inset-2 bg-white/95 rounded transform origin-left animate-[pageFlip_2s_ease-in-out_infinite_0.8s]" />
                  </div>
                  
                  {/* Book lines (simulating text) */}
                  <div className="absolute space-y-1.5 w-12">
                    <div className="h-1 bg-amber-600/20 rounded-full w-8 mx-auto" />
                    <div className="h-1 bg-amber-600/20 rounded-full w-10 mx-auto" />
                    <div className="h-1 bg-amber-600/20 rounded-full w-6 mx-auto" />
                  </div>
                </div>
              </div>

              {/* Loading message with fade transition */}
              <div className="space-y-2 min-h-[80px]">
                <p className="text-2xl font-light text-gray-800 transition-all duration-500">
                  {loadingMessage}
                  <span className="inline-flex ml-1">
                    <span className="animate-[bounce_1s_infinite_0ms]">.</span>
                    <span className="animate-[bounce_1s_infinite_200ms]">.</span>
                    <span className="animate-[bounce_1s_infinite_400ms]">.</span>
                  </span>
                </p>
                
                {/* Inspirational quotes */}
                <p className="text-sm text-gray-500 italic animate-pulse">
                  "Your story is waiting to be written"
                </p>
              </div>

              {/* Progress bar with percentage */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Loading...</span>
                  <span className="text-amber-600 font-semibold">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  >
                    {/* Shimmer effect */}
                    <div className="w-full h-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="flex justify-center space-x-2 pt-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-amber-300 rounded-full animate-[pulse_1s_ease-in-out_infinite]"
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Subtle background decoration */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-amber-200/30 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-orange-200/30 rounded-full blur-3xl -z-10" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}