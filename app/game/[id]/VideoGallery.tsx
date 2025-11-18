import React, { useState } from 'react';

const VideoGallery = ({ game }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const handleNextVideo = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % game.videos.length);
  };

  const handlePrevVideo = () => {
    setCurrentVideoIndex((prevIndex) =>
      prevIndex === 0 ? game.videos.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="w-full">
      <h2 className="text-xl sm:text-2xl font-semibold text-green-light mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
        Additional Videos
      </h2>
      
      <div className="relative bg-grey-dark border border-white/10 rounded-lg overflow-hidden shadow-2xl hover:border-green-light/50 transition-all duration-300 group">
        {/* Video Frame */}
        <iframe
          src={`https://www.youtube.com/embed/${game.videos[currentVideoIndex].video_id}`}
          title={`Video ${currentVideoIndex + 1}`}
          className="w-full aspect-video"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />

        {/* Navigation Buttons */}
        {game.videos.length > 1 && (
          <>
            {currentVideoIndex !== 0 && (
              <button 
                onClick={handlePrevVideo} 
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-green-light/20 border border-white/20 hover:border-green-light p-2 sm:p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                aria-label="Previous video"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            
            {currentVideoIndex !== game.videos.length - 1 && (
              <button 
                onClick={handleNextVideo} 
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-green-light/20 border border-white/20 hover:border-green-light p-2 sm:p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                aria-label="Next video"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </>
        )}

        {/* Dots Navigation */}
        {game.videos.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 flex items-center justify-center gap-1.5 sm:gap-2">
            {game.videos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentVideoIndex(index)}
                className={`transition-all duration-300 rounded-full border-2 ${
                  index === currentVideoIndex
                    ? 'w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-light border-green-light'
                    : 'w-2 h-2 sm:w-2.5 sm:h-2.5 bg-grey-dark border-white/50 hover:border-green-light'
                }`}
                aria-label={`Go to video ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Counter */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-black/60 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/20">
          <span className="text-white text-xs sm:text-sm font-medium">
            {currentVideoIndex + 1} / {game.videos.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoGallery;