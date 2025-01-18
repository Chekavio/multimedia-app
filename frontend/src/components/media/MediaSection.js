import React from 'react';
import MediaRow from './MediaRow';  // ✅ S'assurer que MediaRow est bien importé

const MediaSection = ({ title, items, error, renderItem, onItemClick }) => {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-white">{title}</h2>
        {error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : (
          <MediaRow items={items} onItemClick={onItemClick} renderItem={renderItem} />
        )}
      </section>
    );
  };

export default MediaSection;