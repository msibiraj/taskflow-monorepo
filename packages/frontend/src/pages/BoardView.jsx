import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { boardAPI } from '../services/api';
import socketService from '../services/socket';
import Navbar from '../components/Navbar';
import BoardList from '../components/BoardList';
import NewListModal from '../components/NewListModal';
import NewCardModal from '../components/NewCardModal';
import CardDetailsModal from '../components/CardDetailsModal';
import AddMemberModal from '../components/AddMemberModal';

const BoardView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showListModal, setShowListModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [selectedListId, setSelectedListId] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    loadBoard();
    
    socketService.connect();
    socketService.joinBoard(id);

    socketService.onBoardUpdate((updatedBoard) => {
      setBoard(updatedBoard);
    });

    return () => {
      socketService.leaveBoard(id);
      socketService.offBoardUpdate();
    };
  }, [id]);

  const loadBoard = async () => {
    try {
      const data = await boardAPI.getBoard(id);
      setBoard(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load board');
    } finally {
      setLoading(false);
    }
  };

  const updateBoard = async (updatedBoard) => {
    try {
      await boardAPI.updateBoard(id, updatedBoard);
      setBoard(updatedBoard);
      socketService.emitBoardUpdate(id, updatedBoard);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update board');
    }
  };

  const handleCreateList = async (title) => {
    const newList = {
      id: Date.now().toString(),
      title,
      position: board.lists.length,
      cards: [],
    };

    const updatedBoard = {
      ...board,
      lists: [...board.lists, newList],
    };

    await updateBoard(updatedBoard);
    setShowListModal(false);
  };

  const handleCreateCard = async (cardData) => {
    const newCard = {
      id: Date.now().toString(),
      ...cardData,
      comments: [],
      attachments: [],
      timeTracking: {
        estimatedHours: 0,
        loggedHours: 0,
        isTimerRunning: false,
        timeLogs: [],
      },
      createdAt: new Date(),
    };

    const updatedLists = board.lists.map((list) => {
      if (list.id === selectedListId) {
        return {
          ...list,
          cards: [...list.cards, newCard],
        };
      }
      return list;
    });

    const updatedBoard = {
      ...board,
      lists: updatedLists,
    };

    await updateBoard(updatedBoard);
    setShowCardModal(false);
    setSelectedListId(null);
  };

  const handleMoveCard = async (card, fromListId, toListId) => {
    if (fromListId === toListId) return;

    const updatedLists = board.lists.map((list) => {
      if (list.id === fromListId) {
        return {
          ...list,
          cards: list.cards.filter((c) => c.id !== card.id),
        };
      }
      if (list.id === toListId) {
        return {
          ...list,
          cards: [...list.cards, card],
        };
      }
      return list;
    });

    const updatedBoard = {
      ...board,
      lists: updatedLists,
    };

    await updateBoard(updatedBoard);
  };

  const handleUpdateCard = async (updatedCard, listId) => {
    const updatedLists = board.lists.map((list) => {
      if (list.id === listId) {
        return {
          ...list,
          cards: list.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
        };
      }
      return list;
    });

    const updatedBoard = {
      ...board,
      lists: updatedLists,
    };

    await updateBoard(updatedBoard);
  };

  const handleOpenCardDetails = (card, listId) => {
    setSelectedCard(card);
    setSelectedListId(listId);
    setShowCardDetails(true);
  };

  const handleCloseCardDetails = () => {
    setShowCardDetails(false);
    setSelectedCard(null);
    setSelectedListId(null);
  };

  const openCardModal = (listId) => {
    setSelectedListId(listId);
    setShowCardModal(true);
  };

  const handleAddMember = async (email) => {
    try {
      const updatedBoard = await boardAPI.addMember(id, email);
      setBoard(updatedBoard);
    } catch (err) {
      throw err;
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      const updatedBoard = await boardAPI.removeMember(id, userId);
      setBoard(updatedBoard);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-custom"></div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger alert-custom">Board not found</div>
      </div>
    );
  }

  return (
    <div className="board-view">
      <Navbar onBack={() => navigate('/dashboard')} />

      <div className="container-fluid">
        <div className="board-header">
          <div className="row align-items-center">
            <div className="col-md-6 board-title-section">
              <h1>{board.title}</h1>
              <p className="board-description">{board.description || 'No description'}</p>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="d-flex gap-2 justify-content-md-end flex-wrap">
                <button
                  className="btn btn-secondary-custom"
                  onClick={() => setShowMemberModal(true)}
                >
                  <i className="bi bi-people me-2"></i>
                  Members ({board.members.length})
                </button>
                <button className="btn btn-custom" onClick={() => setShowListModal(true)}>
                  <i className="bi bi-plus-lg me-2"></i>
                  Add List
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger alert-custom mb-4" role="alert">
            {error}
          </div>
        )}

        {board.lists.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-list-task"></i>
            <h3>No Lists Yet</h3>
            <p>Create your first list to organize tasks</p>
            <button className="btn btn-custom mt-3" onClick={() => setShowListModal(true)}>
              <i className="bi bi-plus-lg me-2"></i>
              Add List
            </button>
          </div>
        ) : (
          <div className="lists-container">
            {board.lists.map((list) => (
              <BoardList
                key={list.id}
                list={list}
                onMoveCard={handleMoveCard}
                onAddCard={openCardModal}
                onOpenCardDetails={handleOpenCardDetails}
              />
            ))}
          </div>
        )}
      </div>

      {showListModal && (
        <NewListModal onClose={() => setShowListModal(false)} onCreate={handleCreateList} />
      )}

      {showCardModal && (
        <NewCardModal
          onClose={() => {
            setShowCardModal(false);
            setSelectedListId(null);
          }}
          onCreate={handleCreateCard}
        />
      )}

      {showCardDetails && selectedCard && (
        <CardDetailsModal
          card={selectedCard}
          listId={selectedListId}
          board={board}
          onClose={handleCloseCardDetails}
          onUpdate={handleUpdateCard}
        />
      )}

      {showMemberModal && (
        <AddMemberModal
          board={board}
          onClose={() => setShowMemberModal(false)}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
        />
      )}
    </div>
  );
};

export default BoardView;
