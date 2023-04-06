# CliAssistant

A CLI that converts natural language into shell commands.

## Setup

1. Install CliAssistant:

```sh
npm install -g cli-assistant
```

2. Get your API key from [OpenAI](https://platform.openai.com/account/api-keys)

3. Save the key:

```sh
cli-assistant config set OPENAI_KEY <your token>
```

## Usage

```sh
cli-assistant prompt <your prompt>

# or use the `ai` alias
ca <your prompt>
```
