// Ring 2: the real 150 m road/porch approach takes thousands of physics ticks
// in the complete forest. Keep the 9.5 s boot/walk/resume case quick; this
// longer authored quest leg owns a separate explicit sixty-second budget.
process.env.WILDSHARD_CONTENT_PROOF = '1';
await import('./product-play.test.mjs');
