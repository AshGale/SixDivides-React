import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './TutorialCompletionModal.css';

/**
 * Modal displayed when a user completes the tutorial
 */
const TutorialCompletionModal = ({ show, onClose }) => {
  const navigate = useNavigate();

  const handleStartGame = () => {
    onClose();
    navigate('/new-game');
  };

  const handleReturnHome = () => {
    onClose();
    navigate('/');
  };

  return (
    <Modal 
      show={show} 
      onHide={onClose}
      centered
      backdrop="static"
      keyboard={false}
      className="tutorial-completion-modal"
    >
      <Modal.Header>
        <Modal.Title>Tutorial Completed!</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="completion-content">
          <div className="completion-icon">🎮</div>
          <h3>Congratulations!</h3>
          <p>
            You've successfully completed the SixDivides tutorial. 
            You now understand the basic rules and mechanics of the game.
          </p>
          <p>
            Ready to put your skills to the test in a real game?
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleReturnHome}>
          Return to Home
        </Button>
        <Button variant="primary" onClick={handleStartGame}>
          Start New Game
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TutorialCompletionModal;
