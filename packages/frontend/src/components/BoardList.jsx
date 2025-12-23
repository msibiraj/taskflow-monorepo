import React from 'react';
import Card from './Card';

const BoardList = ({ list, onMoveCard, onAddCard, onOpenCardDetails }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const cardData = e.dataTransfer.getData('card');
    const fromListId = e.dataTransfer.getData('fromListId');
    
    if (cardData && fromListId) {
      const card = JSON.parse(cardData);
      if (fromListId !== list.id) {
        onMoveCard(card, fromListId, list.id);
      }
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = 'rgba(255, 0, 110, 0.1)';
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '';
  };

  return (
    <div 
      className="list" 
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <div className="list-header">
        <h3 className="list-title">{list.title}</h3>
        <span className="badge bg-secondary">{list.cards.length}</span>
      </div>
      <div className="list-cards">
        {list.cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            listId={list.id}
            onOpenDetails={onOpenCardDetails}
          />
        ))}
        <button className="add-card-btn" onClick={() => onAddCard(list.id)}>
          <i className="bi bi-plus-lg me-2"></i>
          Add Card
        </button>
      </div>
    </div>
  );
};

export default BoardList;
