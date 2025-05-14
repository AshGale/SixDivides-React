import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './gameSlice';
import aiReducer from './aiSlice';
import playerReducer from './playerSlice';
import tutorialReducer from './tutorialSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    ai: aiReducer,
    player: playerReducer,
    tutorial: tutorialReducer,
  },
});

export default store;
