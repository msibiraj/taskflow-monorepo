import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { boardAPI } from '../services/api';
import Navbar from '../components/Navbar';
import BoardCard from '../components/BoardCard';
import NewBoardModal from '../components/NewBoardModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      const data = await boardAPI.getBoards();
      setBoards(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (boardData) => {
    try {
      const newBoard = await boardAPI.createBoard(boardData);
      setBoards([...boards, newBoard]);
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create board');
    }
  };

  const handleSelectBoard = (boardId) => {
    navigate(`/board/${boardId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-custom"></div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <div className="dashboard-header">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="dashboard-title">Your Boards</h1>
              <p className="text-muted mt-2">Manage and collaborate on your projects</p>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <button className="btn btn-custom" onClick={() => setShowModal(true)}>
                <i className="bi bi-plus-lg me-2"></i>
                New Board
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {error && (
          <div className="alert alert-danger alert-custom mb-4" role="alert">
            {error}
          </div>
        )}

        {boards.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-kanban"></i>
            <h3>No Boards Yet</h3>
            <p>Create your first board to get started with project management</p>
            <button className="btn btn-custom mt-3" onClick={() => setShowModal(true)}>
              <i className="bi bi-plus-lg me-2"></i>
              Create Board
            </button>
          </div>
        ) : (
          <div className="boards-grid">
            {boards.map((board) => (
              <BoardCard
                key={board._id}
                board={board}
                onClick={() => handleSelectBoard(board._id)}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <NewBoardModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreateBoard}
        />
      )}
    </div>
  );
};

export default Dashboard;
