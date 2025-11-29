const fs = require('fs');
const path = require('path');

function makeChoices(options, correctIndex) {
  const labels = ['A', 'B', 'C', 'D'];
  return options.map((text, i) => ({ option: labels[i], text, is_correct: i === correctIndex }));
}

function main() {
  const root = process.cwd();
  const uniPath = path.join(root, 'incomplete_sentences_unique.json');
  const missingPath = path.join(root, 'IS_missing_preview.json');
  if (!fs.existsSync(uniPath) || !fs.existsSync(missingPath)) {
    console.error('Required files not found. Ensure incomplete_sentences_unique.json and IS_missing_preview.json exist.');
    process.exit(1);
  }

  const unique = JSON.parse(fs.readFileSync(uniPath, 'utf8'));
  const missing = JSON.parse(fs.readFileSync(missingPath, 'utf8'));

  // Manually curated answer key for the remaining missing IS questions
  // Keyed by exact question_text from IS_missing_preview.json
  const answerKey = new Map([
    ["The comptroller has __that in ten years the space used by research department will have to double.", 0], // Predicted
    ["In Piazzo’s latest architectural project, he hopes to __ his flare for blending contemporary and traditional ideas.", 3], // Demonstrate
    ["Cooks must remember that some raw food are very __ and should be refrigerated or chilled until ready to be eaten or cooked.", 3], // Perishable
    ["Practically __ in the group passed up the opportunity to attend computer skills seminar", 2], // No one
    ["The paychecks will be delivered __ they arrive from the accounting departement", 1], // When
    ["As the filming location has not yet been __, the release date has been postponed", 1], // Determined
    ["Tom strongly recommends that the sales people __ more proactive", 1], // be
    ["The business lunch organizers will call us as soon as they __ time", 2], // have
    ["Proposed changes that are not __ with existing safety regulations will not be considered", 2], // Compliant
    ["Nick is a top salesman in our office, __?", 2], // Isn't he
    ["Mr. Pollock __ for work when the weather conditions suddenly worsened", 0], // Was reporting
    ["The work orders have been __ to the production department", 0], // Released
    ["This presentation will demonstrate how Metron computers are superior __ those of our competitors in terms of both features and speed", 3], // to
    ["The talks will take place __ Brussels", 0], // in
    ["Executives of small companies earn __ salaries on the west coast than on the east coast", 2], // higher
    ["If I __ seen it, I wouldn’t have believed it possible", 1], // Had not
    ["For the museum visitor __ for the veteran museum goer, the Museum Highlights Tour offers an excellent opportunity to see the most popular exhibits", 0], // As well as
    ["Consumer confidence fell __ April", 1], // in
    ["Before anyone could even think about it, our accountant __ that their company would go bankrupt", 3], // Had predicted
    ["__ Mr Jeffries to get the job done", 1], // Count on
    ["The corporate headquarters are located in the capital __ the country", 3], // of
    ["A __ trade union would not accept the layoffs of the employees", 2], // Demanding
    ["To vacation at the mountain resort, you must make reservations two to three months __", 0], // Beforehand
    ["There are over thirty keyboard commands that can prompt word-processing procedures, but common usage __ only a few", 3], // Involves
    ["The consultant ____ his business if had advertised.", 0], // could have doubled
    ["Inflation is ___ to affect personal spending quite a bit in July", 1], // Likely
    ["The new office is almost ___ the old one.", 0], // Three times the size of
    ["If is one of the most ___ books on the topic", 3], // Interesting
    ["If Mr Darwin were looking for a permanent job, our recuiter ___ help", 0], // could
  ]);

  const additions = [];
  const skipped = [];
  for (const item of missing) {
    const idx = answerKey.get(item.question_text);
    if (idx === undefined) {
      skipped.push(item.question_text);
      continue;
    }
    const entry = {
      category: 'incomplete_sentences',
      question_text: item.question_text,
      choices: makeChoices(item.options, idx),
      explanation: 'Auto-added from IS source. Chosen option best fits standard English grammar/usage for this sentence.'
    };
    additions.push(entry);
  }

  if (skipped.length) {
    console.warn('No answer mapping for some questions. Skipping these:', skipped.length);
    skipped.slice(0, 10).forEach((q, i) => console.warn(`${i+1}. ${q}`));
  }

  const updated = unique.concat(additions);
  fs.writeFileSync(uniPath, JSON.stringify(updated, null, 2), 'utf8');
  console.log(`Appended ${additions.length} questions to incomplete_sentences_unique.json (from ${missing.length} missing).`);
}

main();
