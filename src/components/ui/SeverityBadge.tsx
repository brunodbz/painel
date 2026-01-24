import React from 'react';
import { Severity } from '../../types';
import { cn, SEVERITY_STYLES, SEVERITY_LABELS } from '../../lib/utils';

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className }) => {
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider",
      SEVERITY_STYLES[severity],
      className
    )}>
      {SEVERITY_LABELS[severity]}
    </span>
  );
};
