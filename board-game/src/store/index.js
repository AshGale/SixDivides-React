import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './gameSlice';
import aiReducer from './aiSlice';
import playerReducer from './playerSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    ai: aiReducer,
    player: playerReducer,
  },
});

export default store;
