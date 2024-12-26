export const loadStateFromLocalStorage = (dispatch) => {
  try {
    const serializedState = localStorage.getItem("userState");
    if (serializedState === null) return undefined;

    const parsedState = JSON.parse(serializedState);

    const currentTime = Date.now();
    if (parsedState.expiresAt && currentTime > parsedState.expiresAt) {
      console.log("State expired. Clearing localStorage.");
      localStorage.removeItem("userState");

      if (dispatch) {
        dispatch({ type: "LOGOUT" });
      }

      return undefined;
    }

    return parsedState.state;
  } catch (error) {
    console.error("Could not load state from localStorage", error);
    return undefined;
  }
};


export const saveStateToLocalStorage = (state, expireInMinutes = 30) => {
  try {
    const serializedState = JSON.stringify({
      state,
      expiresAt: Date.now() + expireInMinutes * 60 * 1000,
    });
    console.log("로컬 스토리지 저장:", serializedState);
    localStorage.setItem("userState", serializedState);
  } catch (error) {
    console.error("로컬 스토리지 저장 실패", error);
  }
};
