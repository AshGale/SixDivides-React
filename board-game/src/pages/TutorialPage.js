import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Row, Col } from 'react-bootstrap';
import './TutorialPage.css';

const TutorialPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  // Define tutorial steps
  const tutorialSteps = [
    {
      title: "Welcome to Dice Chess!",
      content: "This tutorial will guide you through the basics of playing Dice Chess. Follow along to learn how to play!",
      image: null
    },
    {
      title: "The Board",
      content: "The game is played on a chess-like board. Each player has units represented by dice, and a base to protect.",
      image: null
    },
    {
      title: "Moving Units",
      content: "Click on your dice to see possible moves. The number on the die determines how far it can move and what actions it can take.",
      image: null
    },
    {
      title: "Attacking",
      content: "Move your die to an enemy's position to attack them. The attacking die must have a value higher than the defending die to capture it.",
      image: null
    },
    {
      title: "Winning the Game",
      content: "Capture the opponent's base or eliminate all their units to win the game!",
      image: null
    }
  ];

  const goToNextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToHome = () => {
    navigate('/');
  };

  const startTutorialGame = () => {
    // Navigate to the dedicated tutorial game page
    navigate('/tutorial-game');
  };

  return (
    <Container className="tutorial-container">
      <h1>Dice Chess Tutorial</h1>
      
      <div className="tutorial-content">
        <h2>{tutorialSteps[currentStep].title}</h2>
        
        <div className="tutorial-step-content">
          <p>{tutorialSteps[currentStep].content}</p>
          
          {tutorialSteps[currentStep].image && (
            <div className="tutorial-image">
              <img src={tutorialSteps[currentStep].image} alt={`Tutorial step ${currentStep + 1}`} />
            </div>
          )}
        </div>
        
        <div className="tutorial-navigation">
          <Row>
            <Col>
              <Button 
                variant="secondary" 
                onClick={goToPreviousStep} 
                disabled={currentStep === 0}
              >
                Previous
              </Button>
            </Col>
            <Col className="text-center">
              <span className="step-indicator">
                Step {currentStep + 1} of {tutorialSteps.length}
              </span>
            </Col>
            <Col className="text-right">
              {currentStep < tutorialSteps.length - 1 ? (
                <Button variant="primary" onClick={goToNextStep}>
                  Next
                </Button>
              ) : (
                <Button variant="success" onClick={startTutorialGame}>
                  Start Tutorial Game
                </Button>
              )}
            </Col>
          </Row>
        </div>
      </div>
      
      <Button variant="link" onClick={goToHome} className="mt-4">
        Back to Home
      </Button>
    </Container>
  );
};

export default TutorialPage;
