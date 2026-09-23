const fs = require('fs');
const path = require('path');

const storageDir = 'C:\\Users\\fenou\\.gemini\\antigravity-ide\\brain\\7d7deeb2-a255-4f47-865c-7bbdce5fd010\\.tempmediaStorage';
const files = fs.readdirSync(storageDir)
  .filter(f => f.endsWith('.jpg') || f.endsWith('.png'))
  .map(f => {
    const stat = fs.statSync(path.join(storageDir, f));
    return { name: f, size: stat.size, mtime: stat.mtime };
  })
  .filter(f => f.mtime >= new Date('2026-09-13T00:00:00Z'))
  .sort((a, b) => b.size - a.size);

console.log('Top 30 photos réelles importées (les plus nettes/détaillées) :');
files.slice(0, 30).forEach((f, i) => {
  console.log(`[${i+1}] ${f.name} - ${(f.size / 1024).toFixed(1)} Ko - ${f.mtime.toLocaleTimeString()}`);
});
