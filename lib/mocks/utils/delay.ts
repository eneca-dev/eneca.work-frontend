/**
 * Utility for simulating network delays
 */
export async function delay(ms: number | [number, number]): Promise<void> {
  let delayMs: number;
  
  if (Array.isArray(ms)) {
    // Random delay in specified range
    const [min, max] = ms;
    delayMs = Math.floor(Math.random() * (max - min + 1)) + min;
  } else {
    delayMs = ms;
  }
  
  // Add variability ±10% for realism
  const variance = delayMs * 0.1;
  const finalDelay = delayMs + (Math.random() * variance * 2 - variance);
  
  return new Promise(resolve => setTimeout(resolve, finalDelay));
} 