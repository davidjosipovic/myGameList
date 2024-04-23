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
    <section className="w-full md:w-4/5  lg:w-3/6  my-4 sm:order-8 lg:order-7">
      <h3 className="text-2xl text-white mt-5 mb-2">Videos</h3>
      <div className="relative lg:w-5/6">
        <div className="">
          <iframe

            src={`https://www.youtube.com/embed/${game.videos[currentVideoIndex].video_id}`}
            title={`Video ${currentVideoIndex}`}
            className="w-full h-full   p-0.5 aspect-video "
          ></iframe>
        </div>
        {game.videos.length > 1 && (
          <div className="flex items-center justify-center absolute inset-x-0 bottom-4 ">
            {game.videos.map((_, index) => (
              <span
                key={index}
                onClick={() => setCurrentVideoIndex(index)}
                className={`h-2 w-2 rounded-full mx-1 cursor-pointer border  border-white ${
                  index === currentVideoIndex ? 'bg-green-light' : 'bg-grey-dark'
                }`}
              ></span>
            ))}
          </div>
        )}
        {game.videos.length > 1 && (
          <div className="flex items-center ">
            {currentVideoIndex !== 0 && (
              <button onClick={handlePrevVideo} className="absolute top-1/2 bottom-1/2 px-4 ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="2em"
                  viewBox="0 0 256 512"
                  className="fill-grey-dark stroke-white stroke-[16]"
                >
                  <path d="M9.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l128-128c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 256c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-128-128z" />
                </svg>
              </button>
            )}
            {currentVideoIndex !== game.videos.length - 1 && (
              <button onClick={handleNextVideo} className="absolute top-1/2 bottom-1/2 px-4 right-0 ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="2em"
                  viewBox="0 0 256 512"
                  className="fill-grey-dark stroke-white stroke-[16]"
                >
                  <path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default VideoGallery;
