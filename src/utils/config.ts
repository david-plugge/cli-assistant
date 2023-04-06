import path from 'path';
import { homedir } from 'os';
import ini from 'ini';
import fs from 'fs/promises';
import { z } from 'zod';
import { PathLike } from 'fs';
import merge from 'deepmerge';
import { pkgName } from './constants';

const configPath = path.join(homedir(), `.${pkgName}`);

const configSchema = z.object({
    OPENAI_KEY: z
        .string({
            required_error: `Please set your OpenAI API key via "${pkgName} config set OPENAI_KEY your-token"`,
        })
        .refine((key) => key.startsWith('sk-'), 'Must start with "sk-"'),
    model: z.string().default('gpt-3.5-turbo'),
});

export type ClaiConfig = z.infer<typeof configSchema>;

const fileExists = (fp: PathLike) =>
    fs
        .stat(fp)
        .then(() => true)
        .catch(() => false);

async function readConfigFile(): Promise<Partial<ClaiConfig>> {
    if (!(await fileExists(configPath))) {
        return Object.create(null);
    }

    const configString = await fs.readFile(configPath, 'utf8');
    return ini.parse(configString);
}

async function writeConfigFile(config: ClaiConfig) {
    const validatedConfig = configSchema.deepPartial().parse(config);
    const configString = ini.stringify(validatedConfig);
    await fs.writeFile(configPath, configString, 'utf8');
}

export async function getConfig(): Promise<ClaiConfig> {
    const config = await readConfigFile();
    return configSchema.parse(config);
}

export async function setConfig(config: Partial<ClaiConfig>) {
    const existingConfig = await readConfigFile();

    const newConfig = merge(existingConfig, config);

    await writeConfigFile(newConfig);
}
