// This file is deprecated in the Next.js migration
// Use server actions and useTransition() instead of Redux

import { useTransition } from 'react';

export const useAppDispatch = () => {
  const [isPending, startTransition] = useTransition();
  return {
    isPending,
    startTransition,
  };
};

export const useAppSelector = () => {
  // Deprecated - Use server actions instead
  return {};
};
