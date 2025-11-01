// src/components/SplashScreen.jsx

function SplashScreen({ onStart }) {
  return (
    // 1. We'll use 'justify-center' and then control spacing with margins
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-theme-beige p-8">
      
      {/* 1. The Image */}
      {/* We use 'w-full max-w-xs' for the phone width */}
      <div className="w-full max-w-xs overflow-hidden rounded-3xl shadow-xl">
        <img
          src="/assets/mn1.jpg"
          alt="ManoMitra Art"
          // This forces the 14rem (224px) height, creating the rectangle.
          // 'object-cover' crops the square image to fit this rectangle.
          className="h-60 w-full object-cover" 
        />
      </div>

      {/* 2. The Content Area */}
      {/* We add a margin-top to create a fixed space from the image */}
      <div className="mt-8 flex flex-col items-center">
        <h1 className="font-display text-5xl text-theme-text">
          MANOMITRA
        </h1>
        <p className="mt-1 font-display text-sm font-medium tracking-wider text-theme-text">
          AAPKA PERSONAL WELLNESS SAATHI
        </p>
      </div>

      {/* 3. The Button */}
      {/* We add a larger margin-top to push it down, creating the final layout */}
      <button
        onClick={onStart}
        className="mt-40 w-full max-w-xs rounded-full 
          bg-theme-text text-white
          font-display text-lg font-semibold 
          tracking-widest
          shadow-button-3d
          py-3
          transition-all duration-200 
          hover:scale-105
          active:scale-100 active:shadow-none active:translate-x-1 active:translate-y-1
        "
      >
        Get Started
      </button>
      
    </div>
  );
}

export default SplashScreen;