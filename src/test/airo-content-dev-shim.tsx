import type { ReactNode } from 'react';

/** Standalone exports do not include builder editing; render list children unchanged. */
export function ContentListContext({ children }: { field?: string; children: ReactNode }) {
  return <>{children}</>;
}
