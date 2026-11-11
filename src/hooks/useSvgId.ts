import { useId } from 'react';

/**
 * Unique, url()-safe prefix for SVG gradient ids. On the web every SVG
 * shares one document, so two drawings using id="halo" would clash.
 */
export function useSvgId(): (name: string) => string {
  const raw = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return (name: string) => `${name}-${raw}`;
}
