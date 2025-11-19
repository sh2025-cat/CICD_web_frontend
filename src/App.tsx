import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import HomePage from './pages/HomePage';
import RepoDetailPage from './pages/RepoDetailPage';
import DeploymentFlowPage from './pages/DeploymentFlowPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/repo/:type" element={<RepoDetailPage />} />
        <Route path="/deploy/:deploymentId" element={<DeploymentFlowPage />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
