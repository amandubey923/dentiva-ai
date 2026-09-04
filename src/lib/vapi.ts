import Vapi from '@vapi-ai/web';

const vapiApiKey = (process.env.NEXT_PUBLIC_VAPI_API_KEY || (process.env as Record<string, string | undefined>)["NEXT_PUBLIC_VAPI_API_KEY "])?.trim() || "";

export const vapi = new Vapi(vapiApiKey);