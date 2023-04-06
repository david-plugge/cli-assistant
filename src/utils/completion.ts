import { OpenAIApi, Configuration, CreateChatCompletionResponse } from 'openai';
import dedent from 'dedent';
import { platform } from 'os';
import { KnownError } from './errors';
import { ClaiConfig } from './config';
import { ClientRequest, IncomingMessage } from 'http';
import { CreateChatCompletionStreamResponse } from './openaiStreams';

const explainInSecondRequest = true;

function getOpenAi(apiKey: string) {
    const openai = new OpenAIApi(new Configuration({ apiKey }));
    return openai;
}

export async function getScript({
    prompt,
    config,
}: {
    prompt: string;
    config: ClaiConfig;
}) {
    const fullPrompt = getFullPrompt(prompt);
    const script = await generateCompletion({
        prompt: fullPrompt,
        number: 1,
        config,
    });
    return script;
}

export async function generateCompletion({
    prompt,
    number = 1,
    config,
}: {
    prompt: string;
    number?: number;
    config: ClaiConfig;
}) {
    const openAi = getOpenAi(config.OPENAI_KEY);
    try {
        const completion = await openAi.createChatCompletion(
            {
                model: config.model,
                messages: [{ role: 'user', content: prompt }],
                n: Math.min(number, 10),
                stream: true,
            },
            {
                responseType: 'stream',
            }
        );

        return new Promise<string>((res, rej) => {
            const stream = completion.data as unknown as IncomingMessage;

            let streamedData = '';

            stream.on('data', (chunk: Buffer) => {
                const payloads = chunk.toString('utf8').split('\n\n');

                for (const payload of payloads) {
                    if (payload.includes('[DONE]')) {
                        streamedData += '\n';
                        process.stdout.write('\n');
                        return;
                    }
                    if (payload.startsWith('data:')) {
                        const data = payload.replaceAll(/^data:\s*/g, '');
                        try {
                            const response: CreateChatCompletionStreamResponse =
                                JSON.parse(data.trim());
                            const content = response.choices[0]?.delta.content;

                            if (content) {
                                streamedData += content;
                                process.stdout.write(content);
                            }
                        } catch (error) {
                            console.error(
                                `Error with JSON.parse and ${payload}.\n${error}`
                            );
                        }
                    }
                }
            });

            stream.on('end', () => {
                res(streamedData.trim());
            });
            stream.on('error', (e) => rej(e));
        });
    } catch (err) {
        const errorAsAny = err as any;
        if (errorAsAny.code === 'ENOTFOUND') {
            throw new KnownError(
                `Error connecting to ${errorAsAny.hostname} (${errorAsAny.syscall}). Are you connected to the internet?`
            );
        }

        throw errorAsAny;
    }
}

export async function getExplanation({
    script,
    config,
}: {
    script: string;
    config: ClaiConfig;
}) {
    const prompt = getExplanationPrompt(script);
    return await generateCompletion({
        prompt,
        number: 1,
        config,
    });
}

export async function getRevision({
    prompt,
    code,
    config,
}: {
    prompt: string;
    code: string;
    config: ClaiConfig;
}) {
    const fullPrompt = getRevisionPrompt(prompt, code);
    const message = await generateCompletion({
        prompt: fullPrompt,
        number: 1,
        config,
    });
    const script = message.split('```')[1].trim();
    return script;
}

function getExplanationPrompt(script: string) {
    return dedent`
      ${explainBash}
      The script: ${script}
    `;
}

const explainBash = dedent`
    Then please describe the bash script in plain english, step by step, what exactly it does.
    Please describe succintly, use as few words as possible, do not be verbose. 
    If there are multiple steps, please display them as a list.
`;

const platformShells: Partial<Record<NodeJS.Platform, string>> = {
    linux: 'bash',
    win32: 'powershell',
};

const shell = platformShells[platform()] ?? platformShells['linux'];

const generationDetails = dedent`
    Please only reply with the single line ${shell} command. It should be able to be directly run in a ${shell} terminal. Do not include any other text.
`;

function getFullPrompt(prompt: string) {
    return dedent`
      I will give you a prompt to create a single line ${shell} command that one can enter in a terminal and run, based on what is asked in the prompt.
      ${generationDetails}
      ${explainInSecondRequest ? '' : explainBash}
      The prompt is: ${prompt}
    `;
}

function getRevisionPrompt(prompt: string, code: string) {
    return dedent`
      Please update the following ${shell} script based on what is asked in the following prompt.
      The script: ${code}
      The prompt: ${prompt}
      ${generationDetails}
    `;
}
