import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import { DbProvider } from './lib/DbContext';

function App() {
  return (
    <DbProvider>
      <Router>
        <Routes>
          <Route path="/*" element={<Dashboard />} />
        </Routes>
      </Router>
    </DbProvider>
  );
}

export default App;
