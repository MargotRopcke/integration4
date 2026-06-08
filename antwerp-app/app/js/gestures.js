/**
 * Gesture classification from MediaPipe hand landmarks.
 */

export function classifyGesture(lm) {
  const fingerExtended = (tip, base) => lm[tip].y < lm[base].y;
  const fingersClosed =
    !fingerExtended(8, 6) &&
    !fingerExtended(12, 10) &&
    !fingerExtended(16, 14) &&
    !fingerExtended(20, 18);

  const thumbTip = lm[4];
  const thumbMcp = lm[2];
  const wrist = lm[0];

  if (fingersClosed && thumbTip.y < wrist.y - 0.1 && thumbTip.y < thumbMcp.y) {
    return 'thumbsUp';
  }
  if (fingersClosed && thumbTip.y > wrist.y + 0.05 && thumbTip.y > thumbMcp.y) {
    return 'thumbsDown';
  }
  return null;
}

export const GESTURE_HOLD_FRAMES = 12;
