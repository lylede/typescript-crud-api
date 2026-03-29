import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (typeof err === 'string') {
        return res.status(400).json({ message: err });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    }

    return res.status(500).json({ message: err.message });
}