const fs = require('fs');
const path = require('path');

function normalizeQuestion(q) {
  let s = q.normalize('NFKC');
  s = s.replace(/[\u2018\u2019]/g, "'");
  s = s.replace(/[\u201C\u201D]/g, '"');
  // Normalize spacing around punctuation to reduce false mismatches (e.g., "Mr.Kemper" vs "Mr. Kemper")
  s = s.replace(/\s+([,.;:!?])/g, '$1'); // remove spaces before punctuation
  s = s.replace(/\.\s+(?=[A-Za-z])/g, '.'); // remove spaces after periods when followed by letters
  // Ensure spaces around blanks
  s = s.replace(/\s*(__+)\s*/g, ' $1 ');
  s = s.replace(/\s+/g, ' ');
  s = s.trim();
  // Normalize blanks: collapse any run of underscores to two underscores
  s = s.replace(/_{2,}/g, '__');
  s = s.replace(/[\s\.|!|\?]+$/, '');
  return s.toLowerCase();
}

function parseIS(txt) {
  const lines = txt.split(/\r?\n/);
  const items = [];
  let i = 0;
  while (i < lines.length) {
    // find a line that looks like a question (ends with ? or . and not a bare number or header)
    const raw = lines[i].trim();
    const isHeaderOrIndex = /^\d+\.?$/.test(raw) || /^CHOIX MULTIPLE/i.test(raw);
    const looksLikeQuestion = /[\.?]$/.test(raw) || /__+/.test(raw);
    if (/\S/.test(raw) && !isHeaderOrIndex && looksLikeQuestion) {
      const q = raw;
      // next up to 6 lines, collect 4 non-empty option lines
      const options = [];
      let j = i + 1;
      while (j < lines.length && options.length < 4) {
        const t = lines[j].trim();
        if (t.length > 0 && !/^CHOIX MULTIPLE/i.test(t) && !/^\d+\.?$/.test(t)) {
          options.push(t);
        }
        j++;
      }
      if (options.length === 4) {
        items.push({ question_text: q, options });
        i = j; // continue from after options
        continue;
      }
    }
    i++;
  }
  return items;
}

(function main(){
  const root = process.cwd();
  const isPath = path.join(root, 'IS_[1-145].txt');
  const uniPath = path.join(root, 'incomplete_sentences_unique.json');
  const isTxt = fs.readFileSync(isPath, 'utf8');
  const uni = JSON.parse(fs.readFileSync(uniPath, 'utf8'));

  const uniqueKeys = uni.map(x => normalizeQuestion(String(x.question_text || x.text_with_gaps || '')));
  const uniqueSet = new Set(uniqueKeys);

  const isItems = parseIS(isTxt);
  // Debug first few comparisons
  for (const it of isItems.slice(0, 5)) {
    const key = normalizeQuestion(it.question_text);
    console.log('IS key sample:', key, '-> in unique?', uniqueSet.has(key));
  }
  const missing = isItems.filter(it => {
    const key = normalizeQuestion(it.question_text);
    return key && !uniqueSet.has(key);
  });

  fs.writeFileSync(path.join(root, 'IS_missing_preview.json'), JSON.stringify(missing, null, 2));
  console.log(`Parsed ${isItems.length} questions from IS.`);
  console.log(`Unique questions in JSON: ${uniqueSet.size}`);
  console.log(`Example unique keys:`, uniqueKeys.slice(0, 5));
  console.log(`Missing vs unique: ${missing.length}`);
})();
