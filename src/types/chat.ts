import { z } from 'zod';

// Chat message types for LM service
export const ChatMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant', 'tool']),
  content: z.string(),
  tool_call_id: z.string().optional(),
  tool_calls: z.array(z.object({
    id: z.string(),
    type: z.literal('function'),
    function: z.object({
      name: z.string(),
      arguments: z.string()
    })
  })).optional()
});

export const ToolCallSchema = z.object({
  id: z.string(),
  type: z.literal('function'),
  function: z.object({
    name: z.string(),
    arguments: z.string()
  })
});

export const ChatCompletionResponseSchema = z.object({
  choices: z.array(z.object({
    message: z.object({
      role: z.enum(['assistant']),
      content: z.string().nullable(),
      tool_calls: z.array(ToolCallSchema).optional()
    })
  }))
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ToolCall = z.infer<typeof ToolCallSchema>;
export type ChatCompletionResponse = z.infer<typeof ChatCompletionResponseSchema>;
