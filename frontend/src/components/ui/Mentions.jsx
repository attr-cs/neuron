import { Link } from 'react-router-dom';

export const Mentions = ({ text }) => {
  const mentionRegex = /(@[a-zA-Z0-9_-]+)/g;
  const parts = text.split(mentionRegex);
  
  return (
    <span>
      {parts.map((part, index) => {
        if (part.match(mentionRegex)) {
          const username = part.slice(1);
          return (
            <Link
              key={index}
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
              {part}
            </Link>
          );
        }
        return part;
      })}
    </span>
  );
}; 