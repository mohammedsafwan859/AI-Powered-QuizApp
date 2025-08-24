import React from 'react';

export const BoltIcon = () => (
  <svg xmlns="http://www.w.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

// --- USING THE SVG CODE YOU PROVIDED ---
export const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
        {/* Left person */}
        <circle cx="6" cy="6" r="2.5" />
        <path d="M2 20c0-2.5 1.8-4.5 4-4.5s4 2 4 4.5v1H2v-1z" />
        {/* Center person (front) */}
        <circle cx="12" cy="7" r="2.8" />
        <path d="M7.5 21c0-2.8 2-5 4.5-5s4.5 2.2 4.5 5v1h-9v-1z" />
        {/* Right person */}
        <circle cx="18" cy="6" r="2.5" />
        <path d="M14 20c0-2.5 1.8-4.5 4-4.5s4 2 4 4.5v1h-8v-1z" />
    </svg>
);
// --- END OF UPDATE ---

export const PuzzleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
  </svg>
);