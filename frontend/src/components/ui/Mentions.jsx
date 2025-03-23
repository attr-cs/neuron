import { Link } from 'react-router-dom';
import React from 'react';

export const Mentions = ({ text = '' }) => {
  // Ensure text is a string and preserve line breaks by replacing \n with <br/>
  const safeText = String(text || '');
  
  // Regex for mentions and URLs - using non-overlapping patterns
  const mentionRegex = /(@[a-zA-Z0-9_-]+)/g;
  const urlRegex = /\b(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
  
  // Create an array to store all matches and their positions
  const matches = [];
  let match;

  // Find all mentions
  while ((match = mentionRegex.exec(safeText)) !== null) {
    matches.push({
      text: match[0],
      index: match.index,
      length: match[0].length,
      type: 'mention'
    });
  }

  // Find all URLs
  while ((match = urlRegex.exec(safeText)) !== null) {
    matches.push({
      text: match[0],
      index: match.index,
      length: match[0].length,
      type: 'url'
    });
  }

  // Sort matches by index
  matches.sort((a, b) => a.index - b.index);

  // Build the final result
  const result = [];
  let lastIndex = 0;

  matches.forEach((match) => {
    // Add text before the match, handling line breaks
    if (match.index > lastIndex) {
      const textBefore = safeText.slice(lastIndex, match.index);
      result.push(...textBefore.split('\n').map((line, i, arr) => (
        <React.Fragment key={`text-${match.index}-${i}`}>
          {line}
          {i < arr.length - 1 && <br />}
        </React.Fragment>
      )));
    }

    // Add the match
    if (match.type === 'mention') {
      const username = match.text.slice(1); // Remove @ symbol
      result.push(
        <Link
          key={match.index}
          to={`/profile/${username}`}
          className="inline-flex items-center px-1 rounded-md 
            text-blue-600 dark:text-blue-400
            font-medium
            bg-blue-50/50 dark:bg-blue-900/20
            hover:bg-blue-100 dark:hover:bg-blue-900/30
            hover:text-blue-700 dark:hover:text-blue-300
            transition-colors duration-200
            ring-1 ring-blue-200/50 dark:ring-blue-700/30
            hover:ring-blue-300 dark:hover:ring-blue-600/50"
          onClick={(e) => e.stopPropagation()}
        >
          {match.text}
        </Link>
      );
    } else if (match.type === 'url') {
      const url = match.text.startsWith('http') ? match.text : `https://${match.text}`;
      result.push(
        <a
          key={match.index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center
            text-blue-600 dark:text-blue-400
            font-medium
            hover:text-blue-700 dark:hover:text-blue-300
            hover:underline
            transition-colors duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {match.text}
        </a>
      );
    }

    lastIndex = match.index + match.length;
  });

  // Add any remaining text, handling line breaks
  if (lastIndex < safeText.length) {
    const remainingText = safeText.slice(lastIndex);
    result.push(...remainingText.split('\n').map((line, i) => (
      <React.Fragment key={`text-end-${i}`}>
        {line}
        {i < remainingText.split('\n').length - 1 && <br />}
      </React.Fragment>
    )));
  }

  return <span className="whitespace-pre-line">{result}</span>;
}; 