import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Express 4 does not catch rejections from async route handlers — an unhandled
 * rejection takes down the whole Node process (so one failing request kills the
 * API for everyone, and on serverless the caller just hangs with no response).
 * Wrap any async handler that can throw so the error reaches Express's error
 * middleware instead.
 */
export function asyncHandler(handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
