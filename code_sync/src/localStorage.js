export const loadStateFromLocalStorage = () => {
    try {
      const serializedState = localStorage.getItem("userState");
      if (serializedState === null) return undefined; // 초기 상태로 설정
      return JSON.parse(serializedState);
    } catch (error) {
      console.error("Could not load state from localStorage", error);
      return undefined;
    }
  };
  
  export const saveStateToLocalStorage = (state) => {
    try {
      const serializedState = JSON.stringify(state);
      console.log("로컬 스토리지 저장:", serializedState);
      localStorage.setItem("userState", serializedState);
    } catch (error) {
      console.error("로컬 스토리지 저장 실패", error);
    }
  };
  