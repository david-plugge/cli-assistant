import * as p from '@clack/prompts';
import { bgCyan, black } from 'kleur/colors';
import { ClaiConfig, getConfig } from './utils/config';
import { commandName } from './utils/constants';
import {
    getExplanation,
    getRevision,
    getScriptAndInfo,
} from './utils/completion';
import { execSync } from 'child_process';

export async function prompt(prompt: string) {
    const config = await getConfig();

    prompt ||= await getPrompt();

    p.intro(`${bgCyan(black(` ${commandName} `))}`);

    p.log.step('Your script:');
    let { script, info } = await getScriptAndInfo({
        config,
        prompt,
    });

    if (!info) {
        p.log.step('Explanation:');
        info = await getExplanation({
            config,
            script,
        });
    }

    await runOrReviseFlow(script, config);
}

function getPrompt() {
    return p
        .group(
            {
                prompt: () =>
                    p.text({
                        message: 'What would you like me to do?',
                        placeholder: `e.g. list javascript files`,
                        defaultValue: 'Say hello',
                        validate(value) {
                            if (!value) return 'Please enter a prompt.';
                        },
                    }),
            },
            {
                onCancel() {
                    p.cancel('Goodbye!');
                    process.exit(0);
                },
            }
        )
        .then((p) => p.prompt);
}

async function promptForRevision() {
    return p
        .group(
            {
                prompt: () =>
                    p.text({
                        message:
                            'What would you like me to to change in this script?',
                        placeholder: 'e.g. change the folder name',
                        validate(value) {
                            if (!value) return 'Please enter a prompt.';
                        },
                    }),
            },
            {
                onCancel() {
                    p.cancel('Goodbye!');
                    process.exit(0);
                },
            }
        )
        .then((p) => p.prompt);
}

async function runOrReviseFlow(script: string, config: ClaiConfig) {
    const answer = await p.select({
        message: 'Run this script?',
        options: [
            { label: 'Yes', value: 'yes', hint: 'Lets go!' },
            {
                label: 'Revise',
                value: 'revise',
                hint: 'Add some feedback and get a new result',
            },
            { label: 'Cancel', value: 'cancel', hint: 'Exit the program' },
        ],
    });

    if (answer === 'revise') {
        await revisionFlow(script, config);
    } else if (answer === 'yes') {
        p.outro(`Running: ${script}`);
        console.log('');
        execSync(script, { stdio: 'inherit' });
    } else {
        p.cancel('Goodbye!');
        process.exit(0);
    }
}

async function revisionFlow(currentScript: string, config: ClaiConfig) {
    const revision = await promptForRevision();

    p.log.step('Your script:');
    const script = await getRevision({
        prompt: revision,
        code: currentScript,
        config,
    });

    p.log.step('Explanation:');
    const info = await getExplanation({
        script,
        config,
    });

    await runOrReviseFlow(script, config);
}
