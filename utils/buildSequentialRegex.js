function buildSequentialPattern(search) {
  if (!search || typeof search !== 'string') return null;

  const chars = search.replace(/\s+/g, '').split('');
  if (chars.length === 0) return null;

  return chars
    .map((ch) => ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');
}

function buildSequentialRegex(search) {
  const pattern = buildSequentialPattern(search);
  if (!pattern) return null;
  return { $regex: pattern, $options: 'i' };
}

module.exports = {
  buildSequentialPattern,
  buildSequentialRegex,
};
