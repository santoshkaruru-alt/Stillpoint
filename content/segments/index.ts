import type { SegmentContent, SegmentId } from '../../src/models/types';

import { body } from './body';
import { breath } from './breath';
import { closing } from './closing';
import { future } from './future';
import { heart } from './heart';
import { present } from './present';
import { settle } from './settle';

/** All segment content, in session order. */
export const segments: Record<SegmentId, SegmentContent> = {
  settle,
  breath,
  body,
  present,
  heart,
  future,
  closing,
};
