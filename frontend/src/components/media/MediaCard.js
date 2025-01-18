import React from 'react';

const MediaCard = ({ 
    id, 
    title, 
    imageUrl, 
    subtitle, 
    onClick,
    imageHeight = "h-72",
    placeholderSize = "192/288"
  }) => {
    return (
      <div
        className="flex-none w-48 cursor-pointer transform transition-transform hover:scale-105"
        onClick={() => onClick(id)}
      >
        <div className="relative rounded-lg overflow-hidden shadow-lg bg-gray-800">
          <img
            src={imageUrl || `/api/placeholder/${placeholderSize}`}
            alt={title}
            className={`w-full ${imageHeight} object-cover`}
          />
          <div className="p-4">
            <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
            <p className="text-xs text-gray-400">{subtitle}</p>
          </div>
        </div>
      </div>
    );
  };

export default MediaCard;