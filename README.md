# SupaCLI

A CLI that converts natural language into shell commands.

## Setup

1. Install SupaCLI:

```sh
npm install -g supacli
```

2. Get your API key from [OpenAI](https://platform.openai.com/account/api-keys)

3. Save the key:

```sh
supacli config set OPENAI_KEY <your token>
```

## Usage

```sh
supacli prompt <your prompt>

# or use the `ai` alias
ai <your prompt>
```
