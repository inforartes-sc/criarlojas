const { execSync } = require('child_process');
try {
  console.log('Running git status...');
  const status = execSync('git status', { encoding: 'utf8' });
  console.log(status);

  console.log('Running git add .');
  execSync('git add .');

  console.log('Running git commit...');
  const commit = execSync('git commit -m "Fix mobile banner image and benefits grid alignment for lawyer template"', { encoding: 'utf8' });
  console.log(commit);

  console.log('Running git push...');
  const push = execSync('git push', { encoding: 'utf8' });
  console.log(push);
} catch (e) {
  console.error('Error executing git:', e.message || e);
}
