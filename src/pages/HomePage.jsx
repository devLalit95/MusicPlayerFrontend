import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import { 
  FaMusic, 
  FaHeadphones, 
  FaPlay, 
  FaUser, 
  FaUserShield,
  FaArrowRight
} from 'react-icons/fa';
import { 
  IoMusicalNotes,
  IoSparkles
} from 'react-icons/io5';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="app-page-home overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Music Notes */}
        <div className="absolute top-1/4 left-1/4 animate-float">
          <IoMusicalNotes className="text-accent-soft/20 text-6xl" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float delay-1000">
          <FaMusic className="text-accent-tint/20 text-4xl" />
        </div>
        <div className="absolute bottom-1/4 left-1/3 animate-float delay-2000">
          <FaHeadphones className="text-cyan-light/20 text-5xl" />
        </div>
        <div className="absolute top-1/2 right-1/3 animate-float delay-1500">
          <FaPlay className="text-accent-soft/20 text-3xl" />
        </div>
        
        {/* Animated Circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-accent/10 rounded-full animate-pulse-slow"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent-bright/10 rounded-full animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan/5 rounded-full animate-ping-slow"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo & Header */}
          <div className="mb-8 animate-fade-in-down">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-accent via-accent-bright to-cyan rounded-2xl flex items-center justify-center shadow-2xl animate-pulse-glow">
                  <IoMusicalNotes className="text-4xl text-theme-primary" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <IoSparkles className="text-warning text-xl animate-spin-slow" />
                </div>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-accent-soft via-accent-tint to-cyan-light bg-clip-text text-transparent animate-gradient">
              MusicStream
            </h1>
            <p className="text-xl md:text-2xl text-theme-secondary mb-2 animate-fade-in-up">
              Experience Music Like Never Before
            </p>
            <p className="text-theme-muted max-w-2xl mx-auto animate-fade-in-up delay-300">
              Discover millions of songs, create your perfect playlists, and enjoy high-quality audio streaming anywhere, anytime.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in-up delay-500">
            <div className="app-card backdrop-blur-sm rounded-2xl p-6 hover:border-accent/50 transition-all duration-300">
              <div className="text-3xl font-bold text-cyan-light mb-2">10K+</div>
              <div className="text-theme-muted">Songs</div>
            </div>
            <div className="app-card backdrop-blur-sm rounded-2xl p-6 hover:border-accent-bright/50 transition-all duration-300">
              <div className="text-3xl font-bold text-accent-tint mb-2">5K+</div>
              <div className="text-theme-muted">Artists</div>
            </div>
            <div className="app-card backdrop-blur-sm rounded-2xl p-6 hover:border-accent/50 transition-all duration-300">
              <div className="text-3xl font-bold text-accent-soft mb-2">1M+</div>
              <div className="text-theme-muted">Listeners</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up delay-700">
            {/* User Login Button */}
            <button
              onClick={() => navigate('/login')}
              className="group relative px-8 py-4 bg-gradient-to-r from-accent to-accent-bright text-theme-primary rounded-2xl font-bold text-lg hover:from-accent hover:to-accent-bright transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan to-cyan-deep opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center space-x-3">
                <FaUser className="text-xl" />
                <span>Start Listening</span>
                <FaArrowRight className="transform group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </button>

            {/* Admin Login Button */}
            <button
              onClick={() => navigate('/admin')}
              className="group relative px-8 py-4 bg-gradient-to-r from-cyan to-cyan-deep text-theme-primary rounded-2xl font-bold text-lg hover:from-cyan-deep hover:to-cyan-deep transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg border border-cyan-400/50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent-bright opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center space-x-3">
                <FaUserShield className="text-xl" />
                <span>Admin Access</span>
                <FaArrowRight className="transform group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 animate-fade-in-up delay-1000">
            <div className="app-card backdrop-blur-sm rounded-2xl p-6 hover:border-accent/30 transition-all duration-300 group hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-accent to-accent-bright rounded-xl flex items-center justify-center mb-4 group-hover:from-accent group-hover:to-accent-bright transition-all duration-300">
                <FaHeadphones className="text-theme-primary text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-theme-primary">High Quality Audio</h3>
              <p className="text-theme-muted">Experience crystal clear sound with our premium audio streaming.</p>
            </div>

            <div className="app-card backdrop-blur-sm rounded-2xl p-6 hover:border-cyan/30 transition-all duration-300 group hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan to-cyan-deep rounded-xl flex items-center justify-center mb-4 group-hover:from-cyan group-hover:to-cyan-deep transition-all duration-300">
                <IoMusicalNotes className="text-theme-primary text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-theme-primary">Unlimited Songs</h3>
              <p className="text-theme-muted">Access millions of songs from artists all around the world.</p>
            </div>

            <div className="app-card backdrop-blur-sm rounded-2xl p-6 hover:border-accent-bright/30 transition-all duration-300 group hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-accent-bright to-accent rounded-xl flex items-center justify-center mb-4 group-hover:from-accent-bright group-hover:to-accent transition-all duration-300">
                <FaPlay className="text-theme-primary text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-theme-primary">Create Playlists</h3>
              <p className="text-theme-muted">Build your perfect playlists and share them with friends.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 animate-fade-in-up delay-1200">
            <p className="text-theme-muted text-sm">
              Join millions of music lovers worldwide
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;