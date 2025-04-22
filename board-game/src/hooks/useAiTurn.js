import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeAiMove } from '../store/aiSlice';

/**
 * Custom hook to handle AI turns
 * This hook will automatically trigger AI moves when it's an AI player's turn
 */
const useAiTurn = () => {
  const dispatch = useDispatch();
  const { currentPlayer, actions, winner, gameState } = useSelector(state => state.game);
  const { aiPlayers, aiThinking } = useSelector(state => state.ai);
  
  useEffect(() => {
    // Check if current player is AI and game is still in progress
    const isAiTurn = aiPlayers[currentPlayer] !== null && !winner && actions > 0 && !aiThinking;
    
    if (isAiTurn) {
      // Dispatch the AI move action
      dispatch(makeAiMove());
    }
  }, [currentPlayer, actions, winner, aiPlayers, aiThinking, dispatch, gameState]);
  
  return {
    isAiTurn: aiPlayers[currentPlayer] !== null && !winner && actions > 0,
    aiThinking
  };
};

export default useAiTurn;
