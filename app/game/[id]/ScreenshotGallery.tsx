import React, { useEffect, useState } from 'react';
import { Image } from 'next/dist/client/image-component';

const ScreenshotGallery: React.FC<{ screenshots: any[] }> = ({ screenshots }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const changeImage = (newIndex: number) => {
    setCurrentImageIndex(newIndex);
  };

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
    <div className="">
      <div className="relative">
        {screenshots.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-2 pb-4">
            {screenshots.map((_, index) => (
              <span
                key={index}
                onClick={() => changeImage(index)}
                className={`h-2 w-2 rounded-full cursor-pointer ${
                  currentImageIndex === index ? 'bg-emerald-400' : 'bg-gray-200'
                }`}
              ></span>
            ))}
          </div>
        )}
         <div className="flex justify-between">
        <button onClick={prevImage} className=" absolute bottom-0 top-0 left-0  text-white p-2">
        <svg xmlns="http://www.w3.org/2000/svg" height="3em" viewBox="0 0 256 512" className='fill-emerald-400'><path d="M9.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l128-128c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 256c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-128-128z"/></svg>        </button>
        <button onClick={nextImage} className="absolute right-0 bottom-0 top-0   text-white p-2 rounded-full" >
        <svg xmlns="http://www.w3.org/2000/svg" height="3em" viewBox="0 0 256 512" className='fill-emerald-400'><path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"/></svg>

        </button>
      </div>
      <Image
        height={400}
        width={400}
        src={`https:${screenshots[currentImageIndex].url.replace('t_thumb', 't_screenshot_big')}`}
        alt={`Screenshot ${currentImageIndex}`}
        className="w-full"
      />
    </div>
    </div>
  );
};
export default ScreenshotGallery;
