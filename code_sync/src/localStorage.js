export const loadStateFromLocalStorage = (dispatch) => {
  try {
    const serializedState = localStorage.getItem("userState");
    if (serializedState === null) return undefined;

    const parsedState = JSON.parse(serializedState);

    const currentTime = Date.now();
    if (parsedState.expiresAt && currentTime > parsedState.expiresAt) {
      localStorage.removeItem("userState");

      if (dispatch) {
        dispatch({ type: "LOGOUT" });
      }

      return undefined;
    }

    return parsedState.state;
  } catch (error) {
    return undefined;
  }
};


export const saveStateToLocalStorage = (state, expireInMinutes = 30) => {
  try {
    const serializedState = JSON.stringify({
      state,
      expiresAt: Date.now() + expireInMinutes * 60 * 1000,
    });
    localStorage.setItem("userState", serializedState);
  } catch (error) {
  }
};
