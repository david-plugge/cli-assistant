import { dim, red } from 'kleur/colors';
import { repoUrl, version } from './constants';
import { ZodError } from 'zod';

export class KnownError extends Error {}

const indent = ' '.repeat(4);

export function handleCliError(error: any) {
    if (error instanceof ZodError) {
        error.issues.forEach((issue) => {
            console.error(red('Error:'), issue.message);
        });
    } else if (error instanceof Error && !(error instanceof KnownError)) {
        if (error.stack) {
            console.error(dim(error.stack.split('\n').slice(1).join('\n')));
        }

        [
            dim(`clai v${version}`),
            'Please open a Bug report with the information above:',
            `${repoUrl}/issues/new`,
        ].forEach((s) => {
            console.error(`\n${indent}${s}`);
        });
    }
}
