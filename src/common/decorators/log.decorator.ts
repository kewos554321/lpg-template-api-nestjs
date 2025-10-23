import { Logger } from '@nestjs/common';

/**
 * 擴展類別介面，添加 logger 屬性
 */
declare global {
  interface Object {
    logger: Logger;
  }
}

/**
 * LogDecorator - 類別級別的 logger 裝飾器
 * 使用方式: @LogDecorator(ClassName.name)
 * 自動提供 this.logger 功能
 */
export function LogDecorator(context?: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    const loggerContext = context || constructor.name;
    const logger = new Logger(loggerContext);

    // 在類別原型上添加 logger 實例
    Object.defineProperty(constructor.prototype, 'logger', {
      value: logger,
      writable: false,
      enumerable: true,
      configurable: true,
    });

    return constructor;
  };
}
