import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  BarChart3, Upload, TrendingUp, PieChart, Download, 
  LineChart, Users, Calendar, CheckCircle, ArrowRight,
  Star, Zap, Database, Cloud, Lock, Target, Sun, Moon, Menu, X
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
      link: "/dashboard"
    },
    {
      icon: <Upload className="w-8 h-8" />,
      title: "Cloudinary Integration",
      description: "Upload trade screenshots directly to Cloudinary for fast, scalable image storage and management.",
      color: "from-purple-500 to-pink-400",
      link: "/trades"
    },
    {
      icon: <LineChart className="w-8 h-8" />,
      title: "Trading Chart View",
      description: "Visualize trades with candlestick charts showing entry, stop loss, and take profit levels.",
      color: "from-green-500 to-emerald-400",
      link: "/trading-chart"
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "CSV Import System",
      description: "Import trades from any broker with automatic column mapping and duplicate detection.",
      color: "from-orange-500 to-amber-400",
      link: "/trades"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multi-Account Management",
      description: "Track multiple trading accounts separately with prop-firm style drawdown monitoring.",
      color: "from-red-500 to-rose-400",
      link: "/dashboard"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Structured Review System",
      description: "Daily, weekly, and monthly review templates to build discipline and improve consistency.",
      color: "from-indigo-500 to-violet-400",
      link: "/reviews"
    }
  ];

  const benefits = [
    "Improve win rate by identifying patterns",
    "Reduce emotional trading with structured reviews",
    "Track multiple strategies simultaneously",
    "Calculate R-multiples for better risk management",
    "Visual trade analysis with chart integration",
    "Secure cloud storage for trade screenshots"
  ];

  const testimonials = [
    {
      name: "Alex Thompson",
      role: "Forex Trader",
      content: "This journal transformed my trading. The analytics helped me identify my losing patterns and improve my win rate from 45% to 62% in 3 months.",
      avatar: "AT"
    },
    {
      name: "Sarah Chen",
      role: "Options Trader",
      content: "The multi-account feature is a game-changer for managing my prop firm accounts. The drawdown tracking saved me from blowing up.",
      avatar: "SC"
    },
    {
      name: "Marcus Rodriguez",
      role: "Crypto Trader",
      content: "Being able to visualize my trades on charts with entry/exit points has massively improved my execution timing.",
      avatar: "MR"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-white overflow-x-hidden">
      {/* Navigation - Responsive */}
      <nav className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 bg-clip-text text-transparent">
              TradeFX Pro
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              Features
            </a>
            <a href="#testimonials" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              Testimonials
            </a>
            <Link to="/replay" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              Replay
            </Link>
            
            {/* Theme Toggle - Desktop */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
            </button>
            
            <Link 
              to="/login" 
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-400 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity text-sm sm:text-base"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
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
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-3">
              <a 
                href="#features" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors py-2"
              >
                Features
              </a>
              <a 
                href="#testimonials" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors py-2"
              >
                Testimonials
              </a>
              <Link 
                to="/replay" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors py-2"
              >
                Replay
              </Link>
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-400 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Professional Trading Journal &
            <span className="block bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 bg-clip-text text-transparent">
              Analytics Platform
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
            MERN Stack Based Trading Journal & Performance Analytics System with Cloudinary Integration
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <Link 
              to="/register" 
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-400 rounded-xl font-bold text-white hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/trading-chart" 
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Try Chart View
            </Link>
          </div>
        </div>

        {/* Stats - Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mt-12 sm:mt-20 max-w-4xl mx-auto px-4">
          {[
            { label: "Trades Analyzed", value: `${stats.tradesAnalyzed.toLocaleString()}+`, icon: <TrendingUp /> },
            { label: "Active Traders", value: `${stats.users.toLocaleString()}+`, icon: <Users /> },
            { label: "Avg. Win Rate", value: `${stats.winRate}%`, icon: <PieChart /> },
            { label: "Avg. Profit Factor", value: stats.profit.toFixed(1), icon: <Zap /> }
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-blue-500 dark:text-blue-400">{stat.icon}</div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid - Responsive */}
      <section id="features" className="container mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Complete Trading Solution</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
            Everything you need to analyze, improve, and master your trading
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-4">
          {features.map((feature, index) => (
            <Link
              key={feature.title}
              to={feature.link}
              className="bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all hover:scale-[1.02] shadow-sm hover:shadow-md block"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4 md:mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">{feature.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Tech Stack Section - Responsive */}
      <section className="bg-gray-50/50 dark:bg-gray-800/20 py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="px-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-gray-900 dark:text-white">
                Built with Modern Technology Stack
              </h2>
              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base">{benefit}</span>
                  </div>
                ))}
              </div>
              <Link 
                to="/register" 
                className="inline-flex items-center gap-2 px-4 md:px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-400 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Start Your Journey
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm mx-4">
              <div className="flex items-center gap-3 mb-6">
                <Database className="w-6 h-6 text-green-500 dark:text-green-400" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">MERN Stack + Cloudinary</h3>
              </div>
              
              <div className="space-y-4 md:space-y-6">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Frontend</div>
                  <div className="flex flex-wrap gap-2">
                    {["React.js", "TypeScript", "Tailwind CSS", "Recharts", "Lightweight Charts"].map(tech => (
                      <span key={tech} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Backend</div>
                  <div className="flex flex-wrap gap-2">
                    {["Node.js", "Express", "MongoDB", "JWT Auth"].map(tech => (
                      <span key={tech} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs">
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
      </section>

      {/* Testimonials - Responsive */}
      <section id="testimonials" className="container mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Trusted by Traders Worldwide</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
            Join thousands of traders who transformed their performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-4">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center font-bold text-white text-sm md:text-base">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-sm md:text-base">{testimonial.name}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">{testimonial.role}</div>
                </div>
                <div className="ml-auto flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 italic text-sm md:text-base">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section - Responsive */}
      <section className="container mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-400/20 border border-blue-200 dark:border-blue-500/30 rounded-2xl md:rounded-3xl p-6 md:p-12 text-center shadow-lg mx-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-gray-900 dark:text-white">Ready to Transform Your Trading?</h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 md:mb-10 max-w-2xl mx-auto">
            Start your journey to consistent profitability with our professional trading journal system
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="px-6 md:px-8 py-3 md:py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-md"
            >
              Get Started Free
            </Link>
            <Link 
              to="/login" 
              className="px-6 md:px-8 py-3 md:px-8 py-3 md:py-4 border-2 border-blue-500 dark:border-white text-blue-500 dark:text-white rounded-xl font-bold hover:bg-blue-50 dark:hover:bg-white/10 transition-colors"
            >
              Sign In
            </Link>
          </div>
          <div className="flex items-center justify-center gap-3 mt-6 md:mt-8 text-gray-600 dark:text-gray-400">
            <Target className="w-4 h-4" />
            <span className="text-xs md:text-sm">14-day free trial • No credit card required</span>
          </div>
        </div>
      </section>

      {/* Footer - Responsive */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <TrendingUp className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">TradeFX Pro</span>
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm text-center mb-6 md:mb-0">
              MERN Stack Trading Journal & Performance Analytics System
            </div>
            <div className="flex items-center space-x-4 md:space-x-6">
              <Link to="/login" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors text-sm">
                Login
              </Link>
              <Link to="/register" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors text-sm">
                Register
              </Link>
              <Link to="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors text-sm">
                Dashboard
              </Link>
            </div>
          </div>
          <div className="text-center text-gray-500 dark:text-gray-500 text-xs md:text-sm mt-6 md:mt-8">
            © {new Date().getFullYear()} TradeFX. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;