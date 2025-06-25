import { Request, Response, NextFunction, RequestHandler } from 'express';

interface AsyncRequestHandler {
    (req: Request, res: Response, next: NextFunction): Promise<void>;
}

const asyncHandler = (requestHandler: AsyncRequestHandler): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error));
    };
};

export { asyncHandler }