import sade from 'sade';
import { version } from '../package.json';
import { getConfig, setConfig } from './utils/config';
import { prompt } from './prompt';

const prog = sade('clai').version(version);

prog.command('prompt')
    .alias('p')
    .action(async ({ _: promptArr }) => {
        const promptString = promptArr.join(' ');
        await prompt(promptString);
    });

prog.command('config set <key> <value>').action(async (key, value) => {
    await setConfig({
        [key]: value,
    });
});

prog.command('config get <key>').action(async (key) => {
    const config = await getConfig();
    console.log(config[key as keyof typeof config]);
});

prog.parse(process.argv);
