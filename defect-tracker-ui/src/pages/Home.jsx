import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BugAntIcon, 
  CpuChipIcon, 
  SparklesIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* Navbar */}
      <nav className="px-6 py-4 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center gap-2">
          <BugAntIcon className="h-8 w-8 text-blue-500" />
          <span className="text-2xl font-bold text-white">Defect<span className="text-blue-500">Tracker</span></span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link to="/dashboard">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Dashboard
              </button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <button className="px-6 py-2 text-gray-300 hover:text-white transition">
                  Sign In
                </button>
              </Link>
              <Link to="/login">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Get Started
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-500/10 p-4 rounded-full">
              <SparklesIcon className="h-12 w-12 text-blue-500" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            AI-Powered Debugging
            <br />
            <span className="text-blue-500">Smarter, Faster, Automated</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Automatically detect, analyze, and fix defects with cutting-edge AI technology.
            Built for developers who value efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={user ? "/dashboard" : "/login"}>
              <button className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2 text-lg">
                {user ? 'Go to Dashboard' : 'Start Debugging'}
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </Link>
            <button className="px-8 py-4 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition text-lg">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-[#1a1a2e] p-8 rounded-2xl border border-gray-800 hover:border-blue-500 transition">
            <CpuChipIcon className="h-12 w-12 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Quick Submit</h3>
            <p className="text-gray-400">Submit defects instantly with AI-powered analysis and suggestions.</p>
          </div>
          <div className="bg-[#1a1a2e] p-8 rounded-2xl border border-gray-800 hover:border-blue-500 transition">
            <BugAntIcon className="h-12 w-12 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Critical Issues</h3>
            <p className="text-gray-400">Priority detection of critical bugs with immediate notifications.</p>
          </div>
          <div className="bg-[#1a1a2e] p-8 rounded-2xl border border-gray-800 hover:border-blue-500 transition">
            <SparklesIcon className="h-12 w-12 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Smart Diagnostics</h3>
            <p className="text-gray-400">AI-powered code analysis with actionable fix suggestions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;