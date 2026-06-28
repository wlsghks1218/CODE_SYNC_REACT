import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createStore } from 'redux';
import rootReducer from '../../Reducers';

export const createTestStore = (preloadedState = {}) =>
  createStore(rootReducer, preloadedState);

export const renderWithProviders = (
  ui,
  { preloadedState = {}, initialEntries = ['/'] } = {}
) => {
  const store = createTestStore(preloadedState);
  return {
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={initialEntries}>
          {ui}
        </MemoryRouter>
      </Provider>
    ),
    store,
  };
};
