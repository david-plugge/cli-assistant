import { prompt } from './prompt';

const promptString = process.argv.slice(1).join(' ');

await prompt(promptString);
