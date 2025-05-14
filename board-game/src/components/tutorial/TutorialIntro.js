import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import './TutorialIntro.css';

/**
 * Introduction component for the tutorial
 * Displays an overview of the tutorial and lets users start it
 */
const TutorialIntro = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

    const handleStartTutorial = () => {
    // Just navigate to the tutorial with the basic-moves parameter
    // The initialization will happen in the TutorialGamePage
    navigate('/tutorial/basic-moves');
  };

  return (
    <div className="tutorial-intro">
      <h2>Welcome to the SixDivides Tutorial!</h2>
      
      <div className="tutorial-intro-content">
        <p>
          This tutorial will guide you through the basic concepts and rules of SixDivides,
          a strategic board game where dice represent different units with unique abilities.
        </p>
        
        <div className="tutorial-lessons">
          <h3>What you'll learn:</h3>
          <ul>
            <li>How to select and move your units</li>
            <li>Understanding valid moves and unit abilities</li>
            <li>How to attack enemy units</li>
            <li>Using your base to create and upgrade units</li>
            <li>Basic strategy tips to get you started</li>
          </ul>
        </div>
        
        <div className="tutorial-note">
          <p>
            You'll be guided through each step with clear instructions and highlighted
            board elements. Just follow along at your own pace!
          </p>
        </div>
      </div>
      
      <button className="start-tutorial-button" onClick={handleStartTutorial}>
        Start Tutorial
      </button>
    </div>
  );
};

export default TutorialIntro;
