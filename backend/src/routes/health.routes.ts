import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Placeholder endpoints to prevent 404 errors
router.get('/patients', async (req: Request, res: Response) => {
  res.json({ patients: [], message: 'Health module not yet implemented' });
});

router.get('/appointments', async (req: Request, res: Response) => {
  res.json({ appointments: [], message: 'Health module not yet implemented' });
});

router.get('/immunization-records', async (req: Request, res: Response) => {
  res.json({ records: [], message: 'Health module not yet implemented' });
});

export default router;