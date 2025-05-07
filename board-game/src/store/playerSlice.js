import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Map player IDs to player names (default to "Player X")
  playerNames: {
    0: "Player 1",
    1: "Player 2",
    2: "Player 3",
    3: "Player 4",
  }
};

export const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setPlayerName: (state, action) => {
      const { playerId, name } = action.payload;
      state.playerNames[playerId] = name;
    },
    resetPlayerNames: (state) => {
      Object.keys(state.playerNames).forEach(playerId => {
        state.playerNames[playerId] = `Player ${Number(playerId) + 1}`;
      });
    }
  },
});

export const { setPlayerName, resetPlayerNames } = playerSlice.actions;

export default playerSlice.reducer;
