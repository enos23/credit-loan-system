import api from './axiosConfig';

// Sends a chat message + prior conversation history. Returns axios response;
// callers read response.data.{reply, toolCalls, usage}.
//
// History shape (matches backend ChatMessage):
//   [{ role: 'user' | 'assistant', content: [{ type: 'text', text: '...' }] }, ...]
export const sendChatMessage = (message, history = []) =>
    api.post('/Chat/message', { message, history });
