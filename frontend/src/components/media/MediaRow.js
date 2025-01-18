import React from 'react';

const MediaRow = ({ items, onItemClick, renderItem }) => {
  return (
    <div className="overflow-x-auto">
      <div className="flex space-x-4 pb-4">
        {items.map((item) => renderItem(item, onItemClick))}
      </div>
    </div>
  );
};

export default MediaRow;