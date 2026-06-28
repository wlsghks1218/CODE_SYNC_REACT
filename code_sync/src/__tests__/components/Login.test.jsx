import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import Login from '../../Component/Login/Login';
import { renderWithProviders } from '../setup/testUtils';

jest.mock('axios');

describe('Login 컴포넌트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('폼 요소들이 올바르게 렌더링됨', () => {
    renderWithProviders(<Login />);

    expect(screen.getByPlaceholderText('아이디')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('비밀번호')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
    expect(screen.getByText('로그인 기억하기')).toBeInTheDocument();
    expect(screen.getByText('회원가입')).toBeInTheDocument();
  });

  test('초기 상태에서 에러 메시지가 보이지 않음', () => {
    renderWithProviders(<Login />);
    expect(screen.queryByText('유저 정보가 올바르지 않습니다.')).not.toBeInTheDocument();
  });

  test('아이디 입력값이 state에 반영됨', async () => {
    renderWithProviders(<Login />);
    const idInput = screen.getByPlaceholderText('아이디');

    await userEvent.type(idInput, 'testUser');
    expect(idInput.value).toBe('testUser');
  });

  test('비밀번호 입력값이 state에 반영됨', async () => {
    renderWithProviders(<Login />);
    const pwInput = screen.getByPlaceholderText('비밀번호');

    await userEvent.type(pwInput, 'myPassword');
    expect(pwInput.value).toBe('myPassword');
  });

  test('로그인 기억하기 체크박스 토글 동작', async () => {
    renderWithProviders(<Login />);
    const checkbox = screen.getByRole('checkbox');

    expect(checkbox.checked).toBe(false);
    await userEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  test('API 에러 발생 시 에러 메시지 표시', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network Error'));
    renderWithProviders(<Login />);

    await userEvent.type(screen.getByPlaceholderText('아이디'), 'testUser');
    await userEvent.type(screen.getByPlaceholderText('비밀번호'), 'wrongPw');
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(screen.getByText('유저 정보가 올바르지 않습니다.')).toBeInTheDocument();
    });
  });

  test('로그인 실패(비정상 status) 시 에러 메시지 표시', async () => {
    axios.post.mockResolvedValueOnce({ status: 401 });
    renderWithProviders(<Login />);

    await userEvent.type(screen.getByPlaceholderText('아이디'), 'testUser');
    await userEvent.type(screen.getByPlaceholderText('비밀번호'), 'wrongPw');
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(screen.getByText('유저 정보가 올바르지 않습니다.')).toBeInTheDocument();
    });
  });

  test('로그인 성공 시 에러 메시지가 표시되지 않음', async () => {
    axios.post.mockResolvedValueOnce({
      status: 200,
      data: { principal: { user: { userNo: 1, userId: 'testUser', authAdmin: 0 } } },
    });
    renderWithProviders(<Login />);

    await userEvent.type(screen.getByPlaceholderText('아이디'), 'testUser');
    await userEvent.type(screen.getByPlaceholderText('비밀번호'), 'correctPw');
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(screen.queryByText('유저 정보가 올바르지 않습니다.')).not.toBeInTheDocument();
    });
  });

  test('로그인 성공 시 올바른 엔드포인트로 API 요청을 보냄', async () => {
    axios.post.mockResolvedValueOnce({
      status: 200,
      data: { principal: { user: { userNo: 1, userId: 'testUser' } } },
    });
    renderWithProviders(<Login />);

    await userEvent.type(screen.getByPlaceholderText('아이디'), 'testUser');
    await userEvent.type(screen.getByPlaceholderText('비밀번호'), 'correctPw');
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://116.121.53.142:9100/member/login',
        expect.objectContaining({ userId: 'testUser', userPw: 'correctPw' }),
        expect.any(Object)
      );
    });
  });
});
