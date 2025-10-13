import { ControllerBase, ResponseObject, httpStatus } from '@artifact/aurora-api-core';

export class ResponseFormatter extends ControllerBase {
  toResponse<T = any>(data: T, status?: number, refreshToken?: string): ResponseObject {
    const effectiveStatus = status ?? httpStatus.OK;
    return this.formatResponse(data, effectiveStatus as any, refreshToken);
  }
}


