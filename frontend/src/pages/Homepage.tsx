import React from 'react';
import { Heart, Users, Clock, Shield } from 'lucide-react';

const Homepage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Course Project Header */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-8 text-center">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8 mb-12">
          <div className="mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              SOFTWARE ENGINEERING (IT303) COURSE PROJECT TITLE:
            </h2>
            <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              "ONLINE DOCTOR APPOINTMENT SYSTEM"
            </h3>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-4">Carried out by</p>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p>C. Lohith Kumar Reddy (231IT016)</p>
              <p>K. Udayram (231IT032)</p>
              <p>P. Pavan Kumar (231IT046)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-6 leading-tight">
            Your Health, Our Priority
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Connect with qualified doctors, book appointments online, and manage your healthcare journey with ease.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <div className="group text-center p-8 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Heart className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Quality Care
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Connect with verified, experienced doctors across multiple specializations
            </p>
          </div>

          <div className="group text-center p-8 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Clock className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Easy Booking
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Book appointments online 24/7 with real-time availability
            </p>
          </div>

          <div className="group text-center p-8 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Expert Doctors
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Access to qualified healthcare professionals with proven experience
            </p>
          </div>

          <div className="group text-center p-8 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Secure Platform
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Your health data is protected with industry-standard security measures
            </p>
          </div>
        </div>

        {/* How it Works Section */}
        <div className="mt-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Getting healthcare has never been easier - just three simple steps to better health
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection lines */}
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 z-0"></div>
            
            <div className="text-center relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full mb-6 text-2xl font-bold shadow-xl relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full animate-pulse opacity-75"></div>
                <span className="relative z-10">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Choose Your Doctor
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Browse through our list of qualified doctors and select based on specialization and availability
              </p>
            </div>

            <div className="text-center relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full mb-6 text-2xl font-bold shadow-xl relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full animate-pulse opacity-75"></div>
                <span className="relative z-10">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Book Appointment
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Select your preferred date and time slot, and book your appointment instantly
              </p>
            </div>

            <div className="text-center relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-full mb-6 text-2xl font-bold shadow-xl relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-full animate-pulse opacity-75"></div>
                <span className="relative z-10">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Get Treatment
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Meet your doctor at the scheduled time and receive the care you need
              </p>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default Homepage;