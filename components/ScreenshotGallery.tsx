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
                  currentImageIndex === index ? 'bg-indigo-500' : 'bg-gray-300'
                }`}
              ></span>
            ))}
          </div>
        )}
         <div className="flex justify-between">
        <button onClick={prevImage} className=" absolute bottom-0 top-0 my-32 left-0  text-white p-2 rounded-full">
          Previous
        </button>
        <button onClick={nextImage} className="absolute right-0 bottom-0 top-0 my-32  text-white p-2 rounded-full" >
          Next
        </button>
      </div>

      <Image
        height={500}
        width={500}
        src={`https:${screenshots[currentImageIndex].url.replace('t_thumb', 't_screenshot_big')}`}
        alt={`Screenshot ${currentImageIndex}`}
        className="w-full"
      />
    </div>
    </div>
  );
};
export default ScreenshotGallery;
