import React, { useState, useRef, useEffect } from 'react';
import { Music2, User, Heart, LogOut, ChevronDown, Settings } from 'lucide-react';

const PlayerHeader = ({
  user,
  showProfileDropdown,
  profileDropdownRef,
  toggleProfileDropdown,
  handleLogout
}) => {
  return (
    <header className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-black border-b border-zinc-800 px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        {/* App Brand */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Music2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            BEAT BUFF
          </h1>
        </div>

        {/* User Profile */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            onClick={toggleProfileDropdown}
            className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 md:py-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-all duration-200 group border border-zinc-700/50 hover:border-zinc-600"
          >
            <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs md:text-sm font-semibold shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:block text-sm md:text-base font-medium text-white truncate max-w-[120px]">
              {user?.name}
            </span>
            <ChevronDown 
              className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                showProfileDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* User Info Header */}
              <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold truncate">
                      {user?.username}
                    </div>
                    <div className="text-xs text-zinc-400 truncate">
                      {user?.email}
                    </div>
                    <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {user?.role || 'User'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors group text-left">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center transition-colors">
                    <User className="w-4 h-4 text-zinc-400 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                    Profile Settings
                  </span>
                </button>

                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors group text-left">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center transition-colors">
                    <Heart className="w-4 h-4 text-zinc-400 group-hover:text-pink-400 transition-colors" />
                  </div>
                  <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                    Favorite Songs
                  </span>
                </button>

                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors group text-left">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center transition-colors">
                    <Settings className="w-4 h-4 text-zinc-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                    Settings
                  </span>
                </button>
              </div>

              {/* Logout Button */}
              <div className="p-2 border-t border-zinc-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors group text-left border border-red-500/20"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-sm text-red-400 font-medium">
                    Logout
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};


export default PlayerHeader;