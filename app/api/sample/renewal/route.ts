import { start } from 'workflow/api'


export async function POST(req: Request) {
    const { chatId } await req.json();

    if (!chatId) {
        return new Response('Chat ID is required', { status: 400 });
    }
}