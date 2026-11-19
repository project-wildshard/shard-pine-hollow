# Declare Pine's journal images in its source

Pine r7 already ships seven Kit journal PNGs with inherited sticker
color. The author generator used to name the old glyphs and rely on
the SDK to substitute images after the journal row was parsed.

Keep exact copies of those seven PNGs as Pine's declared generator
inputs. Name them at the same product paths and parse the journal
with their image hashes and tint from the start. The existing load
timing for stickers, chalk, sketches and silhouettes stays in place.
