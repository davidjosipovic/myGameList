'use client'
import React, { useState } from 'react';

const VideoGallery = ({ game }) => {
  const videosPerPage = 2;
  const [currentPage, setCurrentPage] = useState(1);

  const startIndex = (currentPage - 1) * videosPerPage;
  const endIndex = startIndex + videosPerPage;
  const visibleVideos = game.videos && game.videos.slice(startIndex, endIndex);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  return (
    <div>
      <div className="flex flex-wrap flex-col md:flex-row">
        {visibleVideos &&
          visibleVideos.map((video, index) => (
            <div key={index} className="md:w-1/2  relative">
              <iframe
                src={`https://www.youtube.com/embed/${video.video_id}`}
                title={`Video ${index}`}
                className="w-full aspect-video h-full p-0.5"
              ></iframe>
              {game.videos.length > 2 && (
                <div className="absolute inset-0 flex items-center">
                  {index === 0 && currentPage > 1 && (
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="px-4 py-2 "
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" height="3em" viewBox="0 0 256 512" className='fill-emerald-400'><path d="M9.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l128-128c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 256c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-128-128z"/></svg>  
                    </button>
                  )}
                  {index === 1 && endIndex < game.videos.length && (
                    <button
                      onClick={handleNextPage}
                      className="ml-auto px-4 py-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" height="3em" viewBox="0 0 256 512" className='fill-emerald-400'><path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"/></svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default VideoGallery;
