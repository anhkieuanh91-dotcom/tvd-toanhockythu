/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/src/components/Layout';
import Home from '@/src/pages/Home';
import Topics from '@/src/pages/Topics';
import Levels from '@/src/pages/Levels';
import Game from '@/src/pages/Game';
import Result from '@/src/pages/Result';
import Leaderboard from '@/src/pages/Leaderboard';
import Guide from '@/src/pages/Guide';
import { LanguageProvider } from '@/src/contexts/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="grade/:gradeId" element={<Topics />} />
            <Route path="grade/:gradeId/topic/:topicId" element={<Levels />} />
            <Route path="grade/:gradeId/topic/:topicId/play/:levelId" element={<Game />} />
            <Route path="result" element={<Result />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="guide" element={<Guide />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
