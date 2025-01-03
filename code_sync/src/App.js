import './App.css';
import { ToastContainer } from 'react-toastify';
import './App.css';
import Display from './Component/Display/Display';
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <Display/>
      <ToastContainer position="top-center"/>
    </>
  );
}

export default App;
