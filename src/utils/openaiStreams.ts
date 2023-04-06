interface CreateChatCompletionStreamResponseChoicesInner {
    delta: { role?: string; content?: string };
    index: number;
    finish_reason: string;
}

export interface CreateChatCompletionStreamResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<CreateChatCompletionStreamResponseChoicesInner>;
}

export type CreateChatCompletionStreamResponseCallback = (
    response: CreateChatCompletionStreamResponse
) => void;
