import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  BarChart3, Upload, TrendingUp, PieChart, Download, 
  LineChart, Users, Calendar, CheckCircle, ArrowRight,
  Star, Zap, Database, Cloud, Lock, Target, Sun, Moon, Menu, X,
  Shield, BarChart, Smartphone, Globe, Clock, Award
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const HomePage = () => {
  const { theme, toggleTheme } = useTheme();
  const [stats, setStats] = useState({
    tradesAnalyzed: 0,
    users: 0,
    winRate: 0,
    profit: 0
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [animatedSections, setAnimatedSections] = useState<Set<number>>(new Set());
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll animation observer
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sectionRefs.current.indexOf(entry.target as HTMLDivElement);
            setAnimatedSections(prev => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );

    sectionRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // Count animation effect
  useEffect(() => {
    const animateCount = (end: number, setter: (val: number) => void, duration = 2000) => {
      let start = 0;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          start = end;
          clearInterval(timer);
        }
        setter(Math.floor(start));
      }, 16);
    };

    animateCount(12750, (val) => setStats(prev => ({ ...prev, tradesAnalyzed: val })));
    animateCount(890, (val) => setStats(prev => ({ ...prev, users: val })));
    animateCount(64, (val) => setStats(prev => ({ ...prev, winRate: val })), 1500);
    animateCount(2.8, (val) => setStats(prev => ({ ...prev, profit: val })), 1800);
  }, []);

  const features = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Advanced Analytics Dashboard",
      description: "Track PnL, win rate, risk-to-reward ratios, and equity curve with detailed performance metrics.",
      color: "from-blue-500 to-cyan-400",
      link: "/dashboard",
      delay: 0
    },
    {
      icon: <Upload className="w-8 h-8" />,
      title: "Cloudinary Integration",
      description: "Upload trade screenshots directly to Cloudinary for fast, scalable image storage and management.",
      color: "from-purple-500 to-pink-400",
      link: "/trades",
      delay: 100
    },
    {
      icon: <LineChart className="w-8 h-8" />,
      title: "Trading Chart View",
      description: "Visualize trades with candlestick charts showing entry, stop loss, and take profit levels.",
      color: "from-green-500 to-emerald-400",
      link: "/trading-chart",
      delay: 200
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "CSV Import System",
      description: "Import trades from any broker with automatic column mapping and duplicate detection.",
      color: "from-orange-500 to-amber-400",
      link: "/trades",
      delay: 300
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multi-Account Management",
      description: "Track multiple trading accounts separately with prop-firm style drawdown monitoring.",
      color: "from-red-500 to-rose-400",
      link: "/dashboard",
      delay: 400
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Structured Review System",
      description: "Daily, weekly, and monthly review templates to build discipline and improve consistency.",
      color: "from-indigo-500 to-violet-400",
      link: "/reviews",
      delay: 500
    }
  ];

  const benefits = [
    { icon: <BarChart className="w-5 h-5" />, text: "Improve win rate by identifying patterns" },
    { icon: <Shield className="w-5 h-5" />, text: "Reduce emotional trading with structured reviews" },
    { icon: <Smartphone className="w-5 h-5" />, text: "Track multiple strategies simultaneously" },
    { icon: <Globe className="w-5 h-5" />, text: "Calculate R-multiples for better risk management" },
    { icon: <Clock className="w-5 h-5" />, text: "Visual trade analysis with chart integration" },
    { icon: <Award className="w-5 h-5" />, text: "Secure cloud storage for trade screenshots" }
  ];

  const testimonials = [
    {
      name: "Alex Thompson",
      role: "Forex Trader",
      content: "This journal transformed my trading. The analytics helped me identify my losing patterns and improve my win rate from 45% to 62% in 3 months.",
      avatar: "AT",
      delay: 0
    },
    {
      name: "Sarah Chen",
      role: "Options Trader",
      content: "The multi-account feature is a game-changer for managing my prop firm accounts. The drawdown tracking saved me from blowing up.",
      avatar: "SC",
      delay: 200
    },
    {
      name: "Marcus Rodriguez",
      role: "Crypto Trader",
      content: "Being able to visualize my trades on charts with entry/exit points has massively improved my execution timing.",
      avatar: "MR",
      delay: 400
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-white overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -left-4 w-72 h-72 bg-blue-300/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-purple-300/10 dark:bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Navigation - Enhanced with scroll effect */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 50 
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-blue-500 dark:text-blue-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 bg-clip-text text-transparent">
                TRADEXA
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300 hover:scale-105">
                Features
              </a>
              <a href="#testimonials" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300 hover:scale-105">
                Testimonials
              </a>
              <Link to="/replay" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300 hover:scale-105">
                Replay
              </Link>
              
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-600 animate-spin-slow" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-400 animate-spin-slow" />
                )}
              </button>
              
              <Link 
                to="/login" 
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-400 rounded-lg font-semibold text-white hover:opacity-90 transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-blue-500/30"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 transition-all duration-300 hover:scale-110"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-600" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-400" />
                )}
              </button>
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 transition-all duration-300"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 animate-spin" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation with Animation */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}>
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="flex flex-col space-y-3">
                <a 
                  href="#features" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300 py-2 transform hover:translate-x-2"
                >
                  Features
                </a>
                <a 
                  href="#testimonials" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300 py-2 transform hover:translate-x-2"
                >
                  Testimonials
                </a>
                <Link 
                  to="/replay" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300 py-2 transform hover:translate-x-2"
                >
                  Replay
                </Link>
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-400 rounded-lg font-semibold text-white hover:opacity-90 transition-all duration-300 transform hover:scale-105 text-center"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Parallax */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up">
              Professional Trading Journal
              <span className="block bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 dark:from-blue-400 dark:via-cyan-300 dark:to-blue-400 bg-clip-text text-transparent bg-size-200 animate-gradient">
                & Analytics Platform
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              MERN Stack Based Trading Journal & Performance Analytics System
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Link 
                to="/register" 
                className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-400 rounded-xl font-bold text-white hover:shadow-xl shadow-blue-500/30 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/trading-chart" 
                className="group px-6 sm:px-8 py-3 sm:py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl font-bold hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
              >
                <span className="bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 bg-clip-text text-transparent">
                  Try Chart View
                </span>
              </Link>
            </div>
          </div>

          {/* Stats with Hover Effects */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mt-12 sm:mt-20 max-w-4xl mx-auto">
            {[
              { label: "Trades Analyzed", value: `${stats.tradesAnalyzed.toLocaleString()}+`, icon: <TrendingUp />, color: "from-blue-500 to-cyan-500" },
              { label: "Active Traders", value: `${stats.users.toLocaleString()}+`, icon: <Users />, color: "from-purple-500 to-pink-500" },
              { label: "Avg. Win Rate", value: `${stats.winRate}%`, icon: <PieChart />, color: "from-green-500 to-emerald-500" },
              { label: "Avg. Profit Factor", value: stats.profit.toFixed(1), icon: <Zap />, color: "from-orange-500 to-amber-500" }
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid with Staggered Animation */}
      <section id="features" className="py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white animate-fade-in-up">
              Complete Trading Solution
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Everything you need to analyze, improve, and master your trading
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                ref={el => sectionRefs.current[index] = el}
                className={`transform transition-all duration-700 ${
                  animatedSections.has(index)
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: `${feature.delay}ms` }}
              >
                <Link
                  to={feature.link}
                  className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-transparent transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] block relative overflow-hidden"
                >
                  {/* Hover effect overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                  <div className="mt-4 flex items-center text-blue-500 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="text-sm font-medium">Learn more</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section with Slide-in Animation */}
      <section className="py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="animate-fade-in-left">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 md:mb-8 text-gray-900 dark:text-white">
                Built with Modern Technology Stack
              </h2>
              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 group transform transition-all duration-300 hover:translate-x-2"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-1 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:scale-110 transition-transform">
                      {benefit.icon}
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base">
                      {benefit.text}
                    </span>
                  </div>
                ))}
              </div>
              <Link 
                to="/register" 
                className="group inline-flex items-center gap-2 px-4 md:px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-400 rounded-lg font-semibold text-white hover:shadow-xl shadow-blue-500/30 transition-all duration-300 transform hover:scale-105"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="animate-fade-in-right">
              <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <Database className="w-6 h-6 text-green-500 dark:text-green-400 animate-pulse" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">MERN Stack + Cloudinary</h3>
                </div>
                
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Frontend</div>
                    <div className="flex flex-wrap gap-2">
                      {["React.js", "TypeScript", "Tailwind CSS", "Recharts", "Lightweight Charts"].map(tech => (
                        <span key={tech} className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:scale-105 transition-transform cursor-default">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Backend</div>
                    <div className="flex flex-wrap gap-2">
                      {["Node.js", "Express", "MongoDB", "JWT Auth"].map(tech => (
                        <span key={tech} className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium hover:scale-105 transition-transform cursor-default">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Cloud className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400 text-sm">Image Storage</span>
                      </div>
                      <span className="font-bold text-green-600 dark:text-green-400 text-sm">Cloudinary</span>
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-500">
                      Secure, scalable screenshot storage with automatic optimization
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400 text-sm">Security</span>
                      </div>
                      <span className="font-bold text-green-600 dark:text-green-400 text-sm">JWT + Bcrypt</span>
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-500">
                      Enterprise-grade authentication and data protection
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials with Fade-in Animation */}
      <section id="testimonials" className="py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Trusted by Traders Worldwide
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Join thousands of traders who transformed their performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="transform transition-all duration-700"
                style={{ 
                  animationDelay: `${testimonial.delay}ms`,
                  transitionDelay: `${testimonial.delay}ms`
                }}
              >
                <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center font-bold text-white text-sm md:text-base group-hover:scale-110 transition-transform duration-300">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white text-sm md:text-base">
                        {testimonial.name}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
                        {testimonial.role}
                      </div>
                    </div>
                    <div className="ml-auto flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-current group-hover:scale-110 transition-transform" style={{ transitionDelay: `${i * 100}ms` }} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 italic text-sm md:text-base">
                    "{testimonial.content}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Pulse Animation */}
      <section className="py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 dark:from-blue-500/20 dark:via-cyan-400/20 dark:to-blue-500/20 border border-blue-200 dark:border-blue-500/30 rounded-2xl md:rounded-3xl p-6 md:p-12 text-center shadow-xl hover:shadow-2xl transition-all duration-300 animate-pulse-slow">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 text-gray-900 dark:text-white">
              Ready to Transform Your Trading?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 md:mb-10 max-w-2xl mx-auto">
              Start your journey to consistent profitability with our professional trading journal system
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="group px-6 md:px-8 py-3 md:py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <span className="bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 bg-clip-text text-transparent">
                  Get Started Free
                </span>
              </Link>
              <Link 
                to="/login" 
                className="group px-6 md:px-8 py-3 md:py-4 border-2 border-blue-500 dark:border-white text-blue-500 dark:text-white rounded-xl font-bold hover:bg-blue-50 dark:hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
              >
                Sign In
              </Link>
            </div>
            <div className="flex items-center justify-center gap-3 mt-6 md:mt-8 text-gray-600 dark:text-gray-400">
              <Target className="w-4 h-4 animate-pulse" />
              <span className="text-xs md:text-sm">14-day free trial • No credit card required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 md:py-12 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <TrendingUp className="w-6 h-6 text-blue-500 dark:text-blue-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="text-xl font-bold text-gray-900 dark:text-white">TradeFX Pro</span>
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm text-center mb-6 md:mb-0">
              MERN Stack Trading Journal & Performance Analytics System
            </div>
            <div className="flex items-center space-x-4 md:space-x-6">
              <Link to="/login" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300 hover:scale-105 text-sm">
                Login
              </Link>
              <Link to="/register" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300 hover:scale-105 text-sm">
                Register
              </Link>
              <Link to="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300 hover:scale-105 text-sm">
                Dashboard
              </Link>
            </div>
          </div>
          <div className="text-center text-gray-500 dark:text-gray-500 text-xs md:text-sm mt-6 md:mt-8">
            © {new Date().getFullYear()} TradeFX. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Add custom animations to global CSS */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .animate-fade-in-left {
          animation: fadeInLeft 0.6s ease-out forwards;
        }
        
        .animate-fade-in-right {
          animation: fadeInRight 0.6s ease-out forwards;
        }
        
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s linear infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Better mobile touch targets */
        @media (max-width: 640px) {
          button, a {
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;