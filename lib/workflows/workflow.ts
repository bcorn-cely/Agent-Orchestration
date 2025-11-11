import { getWritable } from 'workflow';


export async function renewal(chatId: string) {
    'use workflow'
    
    // first logging
    await writeProgress({ namespace: 'Renewal', step: 'Started', message: 'Starting the renewal workflow' });
    // perform renewal work here
    return 'Renewal workflow completed';
}


export async function writeProgress({
    namespace,
    step,
    message,
    data = {}
}: { namespace: string, step: string, message: string, data?: unknown }) {
    'use step'

    const now = new Date().toISOString();
    const composedMessage = `${now} namespace: [${namespace}]\n step: [${step}]\n message: ${message}\n data: ${JSON.stringify(data)}`;

    const writable = getWritable({ namespace });

    const writer =  writable.getWriter()

    await writer.write(composedMessage);
    return composedMessage;
}

// num retries
writeProgress.maxRetries = 3;