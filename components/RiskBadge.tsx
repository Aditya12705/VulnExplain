import React from 'react';

interface Props {
  level: string;
}

export const RiskBadge: React.FC<Props> = ({ level }) => {
  const getStyles = (lvl: string) => {
    switch (lvl.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'safe':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyles(level)}`}>
      {level.toUpperCase()}
    </span>
  );
};