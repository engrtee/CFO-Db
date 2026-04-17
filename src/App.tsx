import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import { DbProvider } from './lib/DbContext';
import { FilterProvider } from './lib/FilterContext';

function App() {
  return (
    <DbProvider>
      <FilterProvider>
        <Router>
          <Routes>
            <Route path="/*" element={<Dashboard />} />
          </Routes>
        </Router>
      </FilterProvider>
    </DbProvider>
  );
}

export default App;
