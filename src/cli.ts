import sade from 'sade';
import { getConfig, setConfig } from './utils/config';
import { prompt } from './prompt';
import { commandName, version } from './utils/constants';

const prog = sade(commandName).version(version);

prog.command('prompt', 'Generate a cli command with natural language', {
    default: true,
})
    .alias('p')
    .action(async ({ _: promptArr }) => {
        const promptString = promptArr.join(' ');
        await prompt(promptString);
    });

prog.command('config set <key> <value>', 'Set a config value').action(
    async (key, value) => {
        await setConfig({
            [key]: value,
        });
    }
);

prog.command('config get <key>', 'Get a config value').action(async (key) => {
    const config = await getConfig();
    console.log(config[key as keyof typeof config]);
});

prog.parse(process.argv);
