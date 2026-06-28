import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createStore } from 'redux';
import axios from 'axios';
import rootReducer from './Reducers';
import App from './App';

jest.mock('axios');

const store = createStore(rootReducer);

test('App이 에러 없이 렌더링됨', () => {
  axios.get.mockResolvedValue({ data: [] });

  render(
    <Provider store={store}>
      <MemoryRouter>
        <App />
      </MemoryRouter>
    </Provider>
  );
});
