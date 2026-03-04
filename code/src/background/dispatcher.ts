import type { RuntimeMessage, RuntimeResponse } from '@/background/types';

type Handler = (payload: unknown) => Promise<unknown>;

/**
 * MessageDispatcher 将 runtime 消息路由到对应处理器。
 */
export class MessageDispatcher {
  private readonly handlers: Record<string, Handler>;

  constructor(handlers: Record<string, Handler>) {
    this.handlers = handlers;
  }

  async dispatch(message: RuntimeMessage): Promise<RuntimeResponse> {
    const handler = this.handlers[message.type];
    if (!handler) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_MESSAGE_TYPE',
          message: `Unsupported message type: ${message.type}`,
        },
        messageId: message.id,
      };
    }

    try {
      const data = await handler(message.payload);
      return { success: true, data, messageId: message.id };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'HANDLER_ERROR',
          message: (error as Error).message,
        },
        messageId: message.id,
      };
    }
  }
}
