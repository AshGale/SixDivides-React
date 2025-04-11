import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './gameSlice';
import aiReducer from './aiSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    ai: aiReducer,
  },
});

export default store;
