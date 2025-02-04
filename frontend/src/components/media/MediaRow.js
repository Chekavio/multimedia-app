import React from 'react';

const MediaRow = ({ items = [], onItemClick, renderItem }) => {
  // Vérifier si items est bien un tableau, sinon définir une valeur par défaut
  if (!Array.isArray(items)) {
    console.error("❌ Erreur: items n'est pas un tableau", items);
    return <div className="text-red-500">Erreur: Impossible de charger les données.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex space-x-4 pb-4">
        {items.length > 0 ? (
          items.map((item) => renderItem(item, onItemClick))
        ) : (
          <p className="text-gray-400">Aucune donnée disponible.</p>
        )}
      </div>
    </div>
  );
};

export default MediaRow;
