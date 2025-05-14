import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { initializeTutorial } from '../store/tutorialSlice';
import './TutorialPage.css';

/**
 * Tutorial introduction page that explains the game basics
 * and provides links to specific tutorial lessons
 */
const TutorialPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleStartLesson = (lessonId) => {
    // Initialize the tutorial state with the selected lesson
    dispatch(initializeTutorial(lessonId));
    // Navigate to the gameplay page with a special state to indicate tutorial mode
    navigate('/game', { 
      state: { 
        isTutorial: true,
        lessonId: lessonId
      } 
    });
  };
  
  return (
    <div className="tutorial-page">
      <div className="tutorial-container">
        <h1>SixDivides Tutorial</h1>
        
        <div className="tutorial-intro">
          <h2>Welcome to the SixDivides Tutorial!</h2>
          
          <div className="tutorial-intro-content">
            <p>
              This tutorial will guide you through the basic concepts and rules of SixDivides,
              a strategic board game where dice represent different units with unique abilities.
            </p>
            
            <div className="tutorial-lessons-section">
              <h3>Tutorial Lessons</h3>
              
              <div className="lesson-cards">
                <div className="lesson-card">
                  <h4>Lesson 1: Basic Moves</h4>
                  <p>Learn how to select and move your units on the board.</p>
                  <button 
                    className="start-lesson-button"
                    onClick={() => handleStartLesson('basic-moves')}
                  >
                    Start Lesson
                  </button>
                </div>
                
                <div className="lesson-card">
                  <h4>Lesson 2: Combat</h4>
                  <p>Learn how to attack enemy units and capture territory.</p>
                  <button 
                    className="start-lesson-button"
                    onClick={() => handleStartLesson('combat')}
                    disabled
                  >
                    Coming Soon
                  </button>
                </div>
                
                <div className="lesson-card">
                  <h4>Lesson 3: Base Operations</h4>
                  <p>Learn how to use your base to create and upgrade units.</p>
                  <button 
                    className="start-lesson-button"
                    onClick={() => handleStartLesson('base-operations')}
                    disabled
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
            
            <div className="tutorial-note">
              <p>
                Tip: Each lesson will guide you through step-by-step instructions with
                highlighted board elements. Take your time and learn at your own pace!
              </p>
            </div>
          </div>
        </div>
        
        <div className="tutorial-actions">
          <button 
            className="menu-button"
            onClick={() => navigate('/')}
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialPage;
