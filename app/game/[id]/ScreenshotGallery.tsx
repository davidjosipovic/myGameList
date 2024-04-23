import React, { useEffect, useState } from 'react';
import { Image } from 'next/dist/client/image-component';

const ScreenshotGallery: React.FC<{ screenshots: any[] }> = ({ screenshots }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);


  const prevImage = () => {
    const newIndex = (currentImageIndex - 1 + screenshots.length) % screenshots.length;
    setCurrentImageIndex(newIndex);
  };

  const nextImage = () => {
    const newIndex = (currentImageIndex + 1) % screenshots.length;
    setCurrentImageIndex(newIndex);
  };

  useEffect(() => {
    // Automatically change the picture every 2 seconds
    const interval = setInterval(() => {
      nextImage();
    }, 5000);

    return () => {
      // Clean up the interval when the component unmounts
      clearInterval(interval);
    };
  }, [currentImageIndex]);

  return (
    <div className="my-8 w-full md:w-4/5 sm:order-7 lg:order-3 lg:w-2/6  lg:bg-black  lg:my-0  ">
      <h1 className='text-2xl text-white mb-2 lg:hidden'>Photos</h1>
      <div className="relative">
        {screenshots.length > 1 && (
          <div className="flex items-center justify-center absolute inset-x-0 bottom-4">
            {screenshots.map((_, index) => (
              <span
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-2 w-2 rounded-full mx-1 cursor-pointer border  border-white ${index === currentImageIndex ? 'bg-green-light' : 'bg-grey-dark'
                  }`}
              ></span>
            ))}
          </div>
        )}
        

        {screenshots.length > 1 && (
          <div className="flex items-center">
            {currentImageIndex !== 0 && (
              <button onClick={prevImage} className="absolute top-1/2 bottom-1/2 px-4">
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
            {currentImageIndex !== screenshots.length - 1 && (
              <button onClick={nextImage} className="absolute top-1/2 bottom-1/2 px-4 right-0">
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
        
        <Image
        priority
          height={400}
          width={400}
          src={`https:${screenshots[currentImageIndex].url.replace('t_thumb', 't_screenshot_big')}`}
          alt={`Screenshot ${currentImageIndex}`}
          className="w-full  lg:py-10 "
        />
      </div>
    </div>
  );
};
export default ScreenshotGallery;
