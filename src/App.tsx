/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import MapEditor from './ui/MapEditor/MapEditor';
import MapTester from './ui/MapTester/MapTester';
import { Map, Gamepad2 } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<'editor' | 'tester'>('tester');

  return (
    <div className="w-full h-screen overflow-hidden bg-gray-950 text-white selection:bg-indigo-500/30 flex flex-col">
      {/* Top Navbar for Mode Switching */}
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center px-4 justify-between z-50 shrink-0">
        <div className="font-bold text-lg text-indigo-400">Magic Campus Remake</div>
        <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-800">
          <button
            onClick={() => setMode('editor')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === 'editor' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Map size={16} /> Editor
          </button>
          <button
            onClick={() => setMode('tester')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === 'tester' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Gamepad2 size={16} /> Tester
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        {mode === 'editor' ? <MapEditor /> : <MapTester />}
      </div>
    </div>
  );
}

