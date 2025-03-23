import logo from './logo.svg';
import './App.css';
import {Routes, Route, Link} from "react-router-dom";
import Main from './Main/Main';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Main />} />
      </Routes>
    </div>
  );
}

export default App;
