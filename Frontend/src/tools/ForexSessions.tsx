import { useEffect, useState } from "react";
import { 
  Globe, 
  Clock, 
  AlertCircle,
  MapPin,
  Activity,
  ChevronDown,
  Check,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Session {
  name: string;
  city: string;
  flag: string;
  open: number;   // UTC hour
  close: number;  // UTC hour
  volume: "High" | "Medium" | "Low";
}

const SESSIONS: Session[] = [
  { name: "Sydney", city: "Sydney", flag: "🇦🇺", open: 21, close: 6, volume: "Medium" },
  { name: "Tokyo", city: "Tokyo", flag: "🇯🇵", open: 0, close: 9, volume: "Medium" },
  { name: "London", city: "London", flag: "🇬🇧", open: 8, close: 17, volume: "High" },
  { name: "New York", city: "New York", flag: "🇺🇸", open: 13, close: 22, volume: "High" },
];

const VOLUME_COLORS = {
  High: "text-red-500 dark:text-red-400",
  Medium: "text-yellow-500 dark:text-yellow-400",
  Low: "text-green-500 dark:text-green-400"
};

const VOLUME_BARS = {
  High: "w-full",
  Medium: "w-2/3",
  Low: "w-1/3"
};

const TIMEZONES = [
  { value: "UTC", label: "UTC (Universal)", cities: "London, Reykjavik" },
  { value: "America/New_York", label: "New York (EST)", cities: "New York, Toronto" },
  { value: "America/Chicago", label: "Chicago (CST)", cities: "Chicago, Mexico City" },
  { value: "America/Denver", label: "Denver (MST)", cities: "Denver, Calgary" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST)", cities: "LA, Vancouver" },
  { value: "Europe/London", label: "London (GMT)", cities: "London, Lisbon" },
  { value: "Europe/Paris", label: "Paris (CET)", cities: "Paris, Berlin, Rome" },
  { value: "Europe/Athens", label: "Athens (EET)", cities: "Athens, Helsinki" },
  { value: "Asia/Dubai", label: "Dubai (GST)", cities: "Dubai, Moscow" },
  { value: "Asia/Karachi", label: "Karachi (PKT)", cities: "Karachi, Islamabad" },
  { value: "Asia/Kolkata", label: "India (IST)", cities: "Mumbai, Delhi" },
  { value: "Asia/Dhaka", label: "Dhaka (BST)", cities: "Dhaka, Almaty" },
  { value: "Asia/Bangkok", label: "Bangkok (ICT)", cities: "Bangkok, Jakarta" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)", cities: "Beijing, Singapore" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)", cities: "Tokyo, Seoul" },
  { value: "Australia/Sydney", label: "Sydney (AEDT)", cities: "Sydney, Melbourne" },
];

export default function ForexSessions() {
  const [now, setNow] = useState(new Date());
  const [displayTimezone, setDisplayTimezone] = useState("UTC");
  const [showTimezonePicker, setShowTimezonePicker] = useState(false);
  const navigate = useNavigate();

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load saved timezone
  useEffect(() => {
    const savedTz = localStorage.getItem('forexTimezone');
    if (savedTz) {
      setDisplayTimezone(savedTz);
    }
  }, []);

  const handleTimezoneChange = (tz: string) => {
    setDisplayTimezone(tz);
    localStorage.setItem('forexTimezone', tz);
    setShowTimezonePicker(false);
  };

  /* ===============================
     CORE RULE: ALL LOGIC IN UTC
  =============================== */
  
  const currentUTCHour = now.getUTCHours();
  const currentUTCMinutes = now.getUTCMinutes();
  const currentUTCSeconds = now.getUTCSeconds();

  const isSessionOpen = (open: number, close: number) => {
    if (open < close) {
      return currentUTCHour >= open && currentUTCHour < close;
    } else {
      return currentUTCHour >= open || currentUTCHour < close;
    }
  };

  const getCountdown = (open: number, close: number) => {
    const nowUTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      currentUTCHour,
      currentUTCMinutes,
      currentUTCSeconds
    ));

    const isOpen = isSessionOpen(open, close);
    const targetHour = isOpen ? close : open;

    let target = new Date(nowUTC);
    target.setUTCHours(targetHour, 0, 0, 0);

    if (target <= nowUTC) {
      target.setUTCDate(target.getUTCDate() + 1);
    }

    const diff = target.getTime() - nowUTC.getTime();
    
    return {
      hours: Math.floor(diff / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };

  const formatTimeInTimezone = (hour: number, minute: number = 0) => {
    try {
      const date = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        hour,
        minute,
        0
      ));

      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: displayTimezone
      });
    } catch (e) {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
  };

  const getTimezoneAbbr = () => {
    if (displayTimezone === "UTC") return "UTC";
    
    try {
      const parts = now.toLocaleTimeString("en-US", {
        timeZone: displayTimezone,
        timeZoneName: "short"
      }).split(" ");
      return parts[parts.length - 1] || displayTimezone.split("/").pop() || "Local";
    } catch (e) {
      return displayTimezone.split("/").pop() || "Local";
    }
  };

  const openSessions = SESSIONS.filter(s => isSessionOpen(s.open, s.close));
  const timezoneAbbr = getTimezoneAbbr();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        
        {/* Only Back Button - No title or timezone text */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-2 
                     bg-white dark:bg-gray-900 
                     border border-gray-200 dark:border-gray-800 
                     rounded-lg text-sm
                     text-gray-700 dark:text-gray-300 
                     hover:border-blue-500 dark:hover:border-blue-600 
                     hover:text-blue-600 dark:hover:text-blue-400
                     transition-all shadow-sm hover:shadow-md
                     hover:scale-[1.02] active:scale-95 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-medium">Back</span>
          </button>

          {/* Timezone Selector Only */}
          <div className="relative">
            <button
              onClick={() => setShowTimezonePicker(!showTimezonePicker)}
              className="flex items-center gap-2 px-3 py-2 
                       bg-white dark:bg-gray-900 
                       border border-gray-200 dark:border-gray-800 
                       rounded-lg text-sm
                       text-gray-700 dark:text-gray-300 
                       hover:border-blue-500 dark:hover:border-blue-600
                       transition-all shadow-sm hover:shadow-md"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline text-gray-600 dark:text-gray-400">
                {timezoneAbbr || 'UTC'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200
                                    ${showTimezonePicker ? 'rotate-180' : ''}`} />
            </button>

            {/* Timezone Dropdown - Theme friendly */}
            {showTimezonePicker && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowTimezonePicker(false)}
                />
                <div className="absolute right-0 mt-2 w-72 z-50
                              bg-white dark:bg-gray-900 
                              border border-gray-200 dark:border-gray-800 
                              rounded-lg shadow-xl overflow-hidden">
                  <div className="p-2.5 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      SELECT TIMEZONE
                    </p>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                    {TIMEZONES.map((tz) => (
                      <button
                        key={tz.value}
                        onClick={() => handleTimezoneChange(tz.value)}
                        className={`w-full px-3 py-2.5 flex items-center justify-between
                                 hover:bg-gray-50 dark:hover:bg-gray-800/50 
                                 transition-colors text-left
                                 ${displayTimezone === tz.value 
                                   ? 'bg-blue-50 dark:bg-blue-900/20' 
                                   : ''}`}
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {tz.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {tz.cities}
                          </p>
                        </div>
                        {displayTimezone === tz.value && (
                          <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Session Stats - Theme friendly */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Active Sessions
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {openSessions.length}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                / {SESSIONS.length}
              </span>
            </p>
            <div className="flex gap-1.5 mt-2">
              {SESSIONS.map((s, i) => {
                const isOpen = isSessionOpen(s.open, s.close);
                return (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300
                              ${isOpen 
                                ? 'bg-green-500 dark:bg-green-600' 
                                : 'bg-gray-200 dark:bg-gray-700'}`}
                  />
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Next Session
            </p>
            {SESSIONS.filter(s => !isSessionOpen(s.open, s.close)).length > 0 ? (
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {SESSIONS.filter(s => !isSessionOpen(s.open, s.close))
                    .sort((a, b) => getCountdown(a.open, a.close).hours - getCountdown(b.open, b.close).hours)[0]?.city}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {SESSIONS.filter(s => !isSessionOpen(s.open, s.close))
                    .map(s => getCountdown(s.open, s.close))
                    .sort((a, b) => a.hours - b.hours)[0]?.hours}h remaining
                </p>
              </div>
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                All sessions active
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800 sm:col-span-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Market Status
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col">
                <span className="text-xs text-gray-600 dark:text-gray-400">Asia</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-2 h-2 rounded-full ${
                    isSessionOpen(21, 6) || isSessionOpen(0, 9) 
                      ? 'bg-green-500 dark:bg-green-600' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {isSessionOpen(21, 6) || isSessionOpen(0, 9) ? 'Active' : 'Closed'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-600 dark:text-gray-400">Europe</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-2 h-2 rounded-full ${
                    isSessionOpen(8, 17) ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {isSessionOpen(8, 17) ? 'Active' : 'Closed'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-600 dark:text-gray-400">US</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-2 h-2 rounded-full ${
                    isSessionOpen(13, 22) ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {isSessionOpen(13, 22) ? 'Active' : 'Closed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Session Cards - Theme friendly */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SESSIONS.map((session) => {
            const isOpen = isSessionOpen(session.open, session.close);
            const countdown = getCountdown(session.open, session.close);
            const openTime = formatTimeInTimezone(session.open);
            const closeTime = formatTimeInTimezone(session.close);

            return (
              <div
                key={session.name}
                className={`group relative bg-white dark:bg-gray-900 rounded-lg overflow-hidden
                          transition-all duration-300 hover:shadow-lg
                          border ${isOpen 
                            ? 'border-green-500/30 dark:border-green-500/20 ring-1 ring-green-500/20 dark:ring-green-500/10' 
                            : 'border-gray-200 dark:border-gray-800'
                          }
                          hover:scale-[1.02] hover:-translate-y-0.5`}
              >
                {/* Status bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 
                              bg-gradient-to-r ${isOpen 
                                ? 'from-green-500 to-green-400 dark:from-green-600 dark:to-green-500' 
                                : 'from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600'
                              }`} />
                
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{session.flag}</span>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-none">
                          {session.city}
                        </h3>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                          {session.name} Session
                        </p>
                      </div>
                    </div>
                    
                    <div className={`px-2 py-0.5 rounded text-[10px] font-medium
                                  ${isOpen 
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                                  }`}>
                      {isOpen ? 'LIVE' : 'Closed'}
                    </div>
                  </div>

                  {/* Trading Hours */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        Hours
                      </p>
                      <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 
                                   text-gray-600 dark:text-gray-400 rounded">
                        {timezoneAbbr}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-medium text-gray-900 dark:text-white">
                        {openTime}
                      </span>
                      <span className="text-[9px] text-gray-400 dark:text-gray-600">→</span>
                      <span className="text-xs font-mono font-medium text-gray-900 dark:text-white">
                        {closeTime}
                      </span>
                    </div>
                    <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-1">
                      UTC: {session.open.toString().padStart(2, '0')}:00-{session.close.toString().padStart(2, '0')}:00
                    </p>
                  </div>

                  {/* Volume */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        Volatility
                      </span>
                      <span className={`text-[10px] font-semibold ${VOLUME_COLORS[session.volume]}`}>
                        {session.volume}
                      </span>
                    </div>
                    <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500
                                  ${session.volume === 'High' ? 'bg-red-500 dark:bg-red-600' : 
                                    session.volume === 'Medium' ? 'bg-yellow-500 dark:bg-yellow-600' : 
                                    'bg-green-500 dark:bg-green-600'}
                                  ${VOLUME_BARS[session.volume]}`}
                      />
                    </div>
                  </div>

                  {/* Countdown */}
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1.5">
                      {isOpen ? 'Closes in' : 'Opens in'}
                    </p>
                    <div className="flex items-center gap-0.5 font-mono">
                      <span className="text-base font-bold text-gray-900 dark:text-white">
                        {countdown.hours.toString().padStart(2, '0')}
                      </span>
                      <span className="text-gray-400 dark:text-gray-600 text-xs">:</span>
                      <span className="text-base font-bold text-gray-900 dark:text-white">
                        {countdown.minutes.toString().padStart(2, '0')}
                      </span>
                      <span className="text-gray-400 dark:text-gray-600 text-xs">:</span>
                      <span className="text-base font-bold text-gray-900 dark:text-white">
                        {countdown.seconds.toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Overlap Alert - Theme friendly */}
        {openSessions.length > 1 && (
          <div className="mt-6 p-4 rounded-lg 
                        bg-gradient-to-r from-amber-50 to-orange-50 
                        dark:from-amber-950/30 dark:to-orange-950/30
                        border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 
                           flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    High Volatility Overlap
                  </h3>
                  <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/50 
                                 text-amber-700 dark:text-amber-400 text-[10px] font-medium rounded">
                    {openSessions.length} Sessions
                  </span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 truncate">
                  {openSessions.map(s => s.city).join(' + ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer - Minimal */}
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center sm:text-left">
            <Activity className="w-3 h-3 inline mr-1" />
            UTC reference • {timezoneAbbr} display
          </p>
        </div>
      </div>
    </div>
  );
}