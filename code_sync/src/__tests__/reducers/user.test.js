import userReducer from '../../Reducers/user';
import { login, logout, updateUser } from '../../Action/userAction';

const initialState = { isAuthenticated: false, user: null };

describe('user reducer', () => {
  test('알 수 없는 액션에서 초기 상태 반환', () => {
    expect(userReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  test('LOGIN: isAuthenticated가 true가 되고 user가 저장됨', () => {
    const mockUser = { userNo: 1, userId: 'testUser', authAdmin: 0 };
    const nextState = userReducer(initialState, login(mockUser));

    expect(nextState.isAuthenticated).toBe(true);
    expect(nextState.user).toEqual(mockUser);
  });

  test('LOGOUT: isAuthenticated가 false가 되고 user가 null이 됨', () => {
    const loggedInState = {
      isAuthenticated: true,
      user: { userNo: 1, userId: 'testUser' },
    };
    const nextState = userReducer(loggedInState, logout());

    expect(nextState.isAuthenticated).toBe(false);
    expect(nextState.user).toBeNull();
  });

  test('UPDATE_USER: user 정보가 업데이트되고 isAuthenticated는 유지됨', () => {
    const loggedInState = {
      isAuthenticated: true,
      user: { userNo: 1, userId: 'oldName' },
    };
    const updatedUser = { userNo: 1, userId: 'newName' };
    const nextState = userReducer(loggedInState, updateUser(updatedUser));

    expect(nextState.user).toEqual(updatedUser);
    expect(nextState.isAuthenticated).toBe(true);
  });

  test('로그인 후 로그아웃하면 초기 상태와 동일', () => {
    const mockUser = { userNo: 1, userId: 'testUser' };
    const afterLogin = userReducer(initialState, login(mockUser));
    const afterLogout = userReducer(afterLogin, logout());

    expect(afterLogout).toEqual(initialState);
  });
});
