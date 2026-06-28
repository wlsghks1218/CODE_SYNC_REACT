import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import Header from '../../Component/Layout/Header';
import { renderWithProviders } from '../setup/testUtils';

jest.mock('axios');

const defaultProps = {
  projects: [],
  fetchProjects: jest.fn(),
  setProjects: jest.fn(),
};

const renderHeader = (preloadedState = {}, props = {}) =>
  renderWithProviders(<Header {...defaultProps} {...props} />, { preloadedState });

const guestState = { user: { isAuthenticated: false, user: null } };
const userState = {
  user: { isAuthenticated: true, user: { userNo: 1, userId: 'tester', authAdmin: 0 } },
};
const adminState = {
  user: { isAuthenticated: true, user: { userNo: 2, userId: 'admin', authAdmin: 2 } },
};

describe('Header 컴포넌트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── 렌더링 ──────────────────────────────────────────────
  test('CODE SYNC 로고가 렌더링됨', () => {
    renderHeader(guestState);
    expect(screen.getByText('CODE SYNC')).toBeInTheDocument();
  });

  // ── 비로그인 상태 ────────────────────────────────────────
  test('비로그인: LOGIN, SIGN IN 버튼 표시', () => {
    renderHeader(guestState);
    expect(screen.getByText('LOGIN')).toBeInTheDocument();
    expect(screen.getByText('SIGN IN')).toBeInTheDocument();
  });

  test('비로그인: LOGOUT, MY PAGE 버튼 미표시', () => {
    renderHeader(guestState);
    expect(screen.queryByText('LOGOUT')).not.toBeInTheDocument();
    expect(screen.queryByText('MY PAGE')).not.toBeInTheDocument();
  });

  // ── 로그인 상태 ──────────────────────────────────────────
  test('로그인: LOGOUT, MY PAGE 버튼 표시', () => {
    renderHeader(userState);
    expect(screen.getByText('LOGOUT')).toBeInTheDocument();
    expect(screen.getByText('MY PAGE')).toBeInTheDocument();
  });

  test('로그인: LOGIN, SIGN IN 버튼 미표시', () => {
    renderHeader(userState);
    expect(screen.queryByText('LOGIN')).not.toBeInTheDocument();
    expect(screen.queryByText('SIGN IN')).not.toBeInTheDocument();
  });

  // ── 관리자 권한 ──────────────────────────────────────────
  test('관리자 계정: MOVE TO ADMIN 버튼 표시', () => {
    renderHeader(adminState);
    expect(screen.getByText('MOVE TO ADMIN')).toBeInTheDocument();
  });

  test('일반 사용자: MOVE TO ADMIN 버튼 미표시', () => {
    renderHeader(userState);
    expect(screen.queryByText('MOVE TO ADMIN')).not.toBeInTheDocument();
  });

  // ── 프로젝트 생성 모달 ───────────────────────────────────
  test('비로그인 상태에서 CREATE PROJECT 클릭 시 로그인 필요 모달 표시', () => {
    renderHeader(guestState);
    fireEvent.click(screen.getByText('CREATE PROJECT'));
    expect(screen.getByText('로그인이 필요합니다.')).toBeInTheDocument();
    expect(screen.getByText('로그인 후 사용 가능한 기능입니다.')).toBeInTheDocument();
  });

  test('로그인 필요 모달 - 돌아가기 버튼 클릭 시 모달 닫힘', () => {
    renderHeader(guestState);
    fireEvent.click(screen.getByText('CREATE PROJECT'));
    expect(screen.getByText('로그인이 필요합니다.')).toBeInTheDocument();

    fireEvent.click(screen.getByText('돌아가기'));
    expect(screen.queryByText('로그인이 필요합니다.')).not.toBeInTheDocument();
  });

  test('로그인 필요 모달 - 배경 클릭 시 모달 닫힘', () => {
    renderHeader(guestState);
    fireEvent.click(screen.getByText('CREATE PROJECT'));
    expect(screen.getByText('로그인이 필요합니다.')).toBeInTheDocument();

    // 모달 배경(ModalBackground) 클릭 - getByRole로 backdrop을 찾기 어려우므로 first child 클릭
    const modal = screen.getByText('로그인이 필요합니다.').closest('div').parentElement.parentElement;
    fireEvent.click(modal);
    expect(screen.queryByText('로그인이 필요합니다.')).not.toBeInTheDocument();
  });

  test('로그인 상태에서 CREATE PROJECT 클릭 시 프로젝트 수 확인 API 호출', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    renderHeader(userState);
    fireEvent.click(screen.getByText('CREATE PROJECT'));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/project/getProjectList')
      );
    });
  });

  test('로그인 상태에서 프로젝트 3개 이상이면 생성 불가 경고', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    axios.get.mockResolvedValueOnce({ data: [1, 2, 3] });
    renderHeader(userState);
    fireEvent.click(screen.getByText('CREATE PROJECT'));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        '프로젝트는 최대 3개까지 생성할 수 있습니다.'
      );
    });
    alertMock.mockRestore();
  });

  test('로그인 상태에서 프로젝트 3개 미만이면 Create Project 모달 표시', async () => {
    axios.get.mockResolvedValueOnce({ data: [1] });
    renderHeader(userState);
    fireEvent.click(screen.getByText('CREATE PROJECT'));

    await waitFor(() => {
      expect(screen.getByText('Create Project')).toBeInTheDocument();
    });
  });
});
