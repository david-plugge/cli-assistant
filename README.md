# SmartCLI

A CLI that converts natural language into shell commands.

## Setup

1. Install SmartCLI:

```sh
npm install -g smartcli
```

2. Get your API key from [OpenAI](https://platform.openai.com/account/api-keys)

3. Save the key:

```sh
smartcli config set OPENAI_KEY <your token>
```

## Usage

```sh
smartcli prompt <your prompt>

# or use the `ai` alias
ai <your prompt>
```
