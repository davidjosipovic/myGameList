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
      <div className="flex flex-wrap">
        {visibleVideos &&
          visibleVideos.map((video, index) => (
            <div key={index} className="w-1/2 p-2 relative">
              <iframe
                src={`https://www.youtube.com/embed/${video.video_id}`}
                title={`Video ${index}`}
                className="w-full aspect-video h-full p-0.5"
              ></iframe>
              <div className="absolute inset-0 flex items-center">
                {index === 0 && (
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-blue-500 text-white"
                  >
                    Previous
                  </button>
                )}
                {index === 1 && (
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === Math.ceil(game.videos.length / videosPerPage)}
                    className="ml-auto px-4 py-2 bg-blue-500 text-white"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default VideoGallery;
