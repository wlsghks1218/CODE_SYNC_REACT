import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Join from '../../Component/Login/Join';

jest.mock('axios');

const renderJoin = () =>
  render(
    <MemoryRouter>
      <Join />
    </MemoryRouter>
  );

describe('Join 컴포넌트', () => {
  let alertMock;

  beforeEach(() => {
    jest.clearAllMocks();
    alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertMock.mockRestore();
  });

  // ── 렌더링 ──────────────────────────────────────────────
  test('폼 요소들이 올바르게 렌더링됨', () => {
    renderJoin();

    expect(screen.getByPlaceholderText('아이디')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('비밀번호')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('비밀번호 확인')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('이메일')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '중복확인' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '인증코드 전송' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '회원가입' })).toBeInTheDocument();
  });

  // ── 유효성 검사 ─────────────────────────────────────────
  test('아이디 4자 미만이면 유효성 검사 경고', async () => {
    renderJoin();

    await userEvent.type(screen.getByPlaceholderText('아이디'), 'abc');
    await userEvent.type(screen.getByPlaceholderText('비밀번호'), 'Password1');
    await userEvent.type(screen.getByPlaceholderText('비밀번호 확인'), 'Password1');
    await userEvent.type(screen.getByPlaceholderText('이메일'), 'test@test.com');
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }));

    expect(alertMock).toHaveBeenCalledWith(
      '아이디는 4~12자의 알파벳 대소문자와 숫자로 구성되어야 합니다.'
    );
  });

  test('아이디 특수문자 포함 시 유효성 검사 경고', async () => {
    renderJoin();

    await userEvent.type(screen.getByPlaceholderText('아이디'), 'user!@#');
    await userEvent.type(screen.getByPlaceholderText('비밀번호'), 'Password1');
    await userEvent.type(screen.getByPlaceholderText('비밀번호 확인'), 'Password1');
    await userEvent.type(screen.getByPlaceholderText('이메일'), 'test@test.com');
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }));

    expect(alertMock).toHaveBeenCalledWith(
      '아이디는 4~12자의 알파벳 대소문자와 숫자로 구성되어야 합니다.'
    );
  });

  test('비밀번호 8자 미만이면 유효성 검사 경고', async () => {
    renderJoin();

    await userEvent.type(screen.getByPlaceholderText('아이디'), 'testuser');
    await userEvent.type(screen.getByPlaceholderText('비밀번호'), 'short1');
    await userEvent.type(screen.getByPlaceholderText('비밀번호 확인'), 'short1');
    await userEvent.type(screen.getByPlaceholderText('이메일'), 'test@test.com');
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }));

    expect(alertMock).toHaveBeenCalledWith(
      '비밀번호는 최소 8자 이상이며, 대문자, 소문자, 숫자를 포함해야 합니다.'
    );
  });

  test('비밀번호에 숫자 미포함 시 유효성 검사 경고', async () => {
    renderJoin();

    await userEvent.type(screen.getByPlaceholderText('아이디'), 'testuser');
    await userEvent.type(screen.getByPlaceholderText('비밀번호'), 'NoNumbers!');
    await userEvent.type(screen.getByPlaceholderText('비밀번호 확인'), 'NoNumbers!');
    await userEvent.type(screen.getByPlaceholderText('이메일'), 'test@test.com');
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }));

    expect(alertMock).toHaveBeenCalledWith(
      '비밀번호는 최소 8자 이상이며, 대문자, 소문자, 숫자를 포함해야 합니다.'
    );
  });

  test('유효하지 않은 이메일 형식이면 유효성 검사 경고', async () => {
    renderJoin();

    await userEvent.type(screen.getByPlaceholderText('아이디'), 'testuser');
    await userEvent.type(screen.getByPlaceholderText('비밀번호'), 'Password1');
    await userEvent.type(screen.getByPlaceholderText('비밀번호 확인'), 'Password1');
    await userEvent.type(screen.getByPlaceholderText('이메일'), 'not-an-email');
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }));

    expect(alertMock).toHaveBeenCalledWith('유효한 이메일 주소를 입력해주세요.');
  });

  test('비밀번호와 비밀번호 확인이 다르면 경고', async () => {
    axios.post.mockResolvedValueOnce({ data: { isDuplicate: false } });
    renderJoin();

    await userEvent.type(screen.getByPlaceholderText('아이디'), 'testuser');
    fireEvent.click(screen.getByRole('button', { name: '중복확인' }));

    await userEvent.type(screen.getByPlaceholderText('비밀번호'), 'Password1');
    await userEvent.type(screen.getByPlaceholderText('비밀번호 확인'), 'Different1');
    await userEvent.type(screen.getByPlaceholderText('이메일'), 'test@test.com');
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('비밀번호가 일치하지 않습니다.');
    });
  });

  // ── 중복 확인 ───────────────────────────────────────────
  test('중복 아이디일 경우 중복 메시지 표시', async () => {
    axios.post.mockResolvedValueOnce({ data: { isDuplicate: true } });
    renderJoin();

    await userEvent.type(screen.getByPlaceholderText('아이디'), 'existingUser');
    fireEvent.click(screen.getByRole('button', { name: '중복확인' }));

    await waitFor(() => {
      expect(screen.getByText('이미 존재하는 아이디입니다.')).toBeInTheDocument();
    });
  });

  test('사용 가능한 아이디일 경우 사용 가능 메시지 표시', async () => {
    axios.post.mockResolvedValueOnce({ data: { isDuplicate: false } });
    renderJoin();

    await userEvent.type(screen.getByPlaceholderText('아이디'), 'newUser');
    fireEvent.click(screen.getByRole('button', { name: '중복확인' }));

    await waitFor(() => {
      expect(screen.getByText('사용 가능한 아이디입니다!')).toBeInTheDocument();
    });
  });

  test('아이디 없이 중복확인 클릭 시 경고', async () => {
    renderJoin();
    fireEvent.click(screen.getByRole('button', { name: '중복확인' }));
    expect(alertMock).toHaveBeenCalledWith('아이디를 입력해주세요.');
  });

  // ── 이메일 인증 ─────────────────────────────────────────
  test('인증코드 전송 성공 시 인증코드 입력 필드 노출', async () => {
    axios.post.mockResolvedValueOnce({
      status: 200,
      data: { verificationCode: '123456' },
    });
    renderJoin();

    await userEvent.type(screen.getByPlaceholderText('이메일'), 'test@test.com');
    fireEvent.click(screen.getByRole('button', { name: '인증코드 전송' }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('인증 코드 입력')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '인증완료' })).toBeInTheDocument();
    });
  });

  test('이메일 없이 인증코드 전송 클릭 시 경고', async () => {
    renderJoin();
    fireEvent.click(screen.getByRole('button', { name: '인증코드 전송' }));
    expect(alertMock).toHaveBeenCalledWith('이메일을 입력해주세요.');
  });
});
