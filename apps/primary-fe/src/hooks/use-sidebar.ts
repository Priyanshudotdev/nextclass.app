import { useState, useEffect, useCallback } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(max-width: 1024px)');
}

export function useSidebarState() {
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
      setIsCollapsed(false);
    } else {
      setIsOpen(true);
    }
  }, [isMobile]);

  const toggle = useCallback(() => {
    if (isMobile) {
      setIsOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  }, [isMobile]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return {
    isOpen,
    isCollapsed: isMobile ? false : isCollapsed,
    isMobile,
    toggle,
    open,
    close,
  };
}
