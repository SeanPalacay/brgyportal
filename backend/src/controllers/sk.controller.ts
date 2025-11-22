import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';
import { generateCertificatePDF } from '../utils/certificateGenerator';

export const getSKAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { range = '6months' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '1month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 6);
    }

    // Get events in date range
    const events = await prisma.event.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      include: {
        registrations: {
          include: {
            user: true
          }
        }
      }
    });

    // Calculate summary statistics
    const totalEvents = events.length;
    const completedEvents = events.filter(e => new Date(e.eventDate) < now).length;
    const totalRegistrations = events.reduce((sum, event) => sum + event.registrations.length, 0);
    const uniqueParticipants = new Set(events.flatMap(e => e.registrations.map(r => r.userId))).size;
    // Get actual attendance data
    const totalAttendance = await prisma.eventAttendance.count({
      where: {
        event: {
          createdAt: {
            gte: startDate,
            lte: now
          }
        }
      }
    });
    
    const averageAttendance = totalRegistrations > 0 ? (totalAttendance / totalRegistrations) * 100 : 0;

    // Get actual user ages from registrations
    const userIds = [...new Set(events.flatMap(e => e.registrations.map(r => r.userId)))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: { patients: { select: { dateOfBirth: true, gender: true } } }
    });

    const ageGroups = { '15-17': 0, '18-21': 0, '22-25': 0, '26-30': 0 };
    users.forEach(user => {
      if (user.patients.length > 0) {
        const age = new Date().getFullYear() - new Date(user.patients[0].dateOfBirth).getFullYear();
        if (age >= 15 && age <= 17) ageGroups['15-17']++;
        else if (age >= 18 && age <= 21) ageGroups['18-21']++;
        else if (age >= 22 && age <= 25) ageGroups['22-25']++;
        else if (age >= 26 && age <= 30) ageGroups['26-30']++;
      }
    });

    const byAgeGroup = Object.entries(ageGroups).map(([ageGroup, count]) => ({ ageGroup, count }));

    // Events by category
    const categoryCount = events.reduce((acc, event) => {
      const category = event.category || 'General';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count
    }));

    // Monthly trends
    const monthlyData = {} as Record<string, { participants: number; events: number }>;
    events.forEach(event => {
      const month = event.createdAt.toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { participants: 0, events: 0 };
      }
      monthlyData[month].events += 1;
      monthlyData[month].participants += event.registrations.length;
    });

    const monthlyTrends = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data
    }));

    // Top events
    const topEvents = events
      .sort((a, b) => b.registrations.length - a.registrations.length)
      .slice(0, 5)
      .map(event => ({
        title: event.title,
        participants: event.registrations.length,
        attendanceRate: `${Math.min(100, (event.registrations.length / Math.max(event.maxParticipants || 50, event.registrations.length)) * 100).toFixed(1)}%`
      }));

    // Calculate actual repeat vs new participants
    const participantEventCounts = events.reduce((acc, event) => {
      event.registrations.forEach(reg => {
        acc[reg.userId] = (acc[reg.userId] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const repeatParticipants = Object.values(participantEventCounts).filter(count => count > 1).length;
    const newParticipants = uniqueParticipants - repeatParticipants;
    const engagementScore = Math.min(100, Math.floor(averageAttendance + (repeatParticipants / Math.max(uniqueParticipants, 1)) * 30));

    const analytics = {
      summary: {
        totalEvents,
        totalParticipants: uniqueParticipants,
        averageAttendance,
        completedEvents
      },
      participation: {
        byAgeGroup,
        byGender: users.reduce((acc, user) => {
          if (user.patients.length > 0) {
            const gender = user.patients[0].gender;
            const existing = acc.find(g => g.gender === gender);
            if (existing) existing.count++;
            else acc.push({ gender, count: 1 });
          }
          return acc;
        }, [] as { gender: string; count: number }[]),
        monthlyTrends
      },
      events: {
        byCategory,
        topEvents
      },
      engagement: {
        repeatParticipants,
        newParticipants,
        engagementScore
      }
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Error fetching SK analytics:', error);
    res.status(500).json({ error: 'Failed to fetch SK analytics' });
  }
};

// ========== CERTIFICATE MANAGEMENT ==========

export const createSKCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const {
      eventId,
      userId,
      certificateType,
      certificateNumber,
      purpose,
      achievements,
      recommendations,
      expiryDate,
      issuedBy
    } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch the issuer's name
    let issuedByName = issuedBy;
    if (issuedBy) {
      const issuer = await prisma.user.findUnique({
        where: { id: issuedBy }
      });
      if (issuer) {
        issuedByName = `${issuer.firstName} ${issuer.lastName}`;
      }
    }

    const certificate = await prisma.certificate.create({
      data: {
        eventId,
        certificateType,
        recipientName: `${user.firstName} ${user.lastName}`,
        issuedFor: purpose || certificateType,
        issuedBy: issuedByName,
        certificateData: {
          certificateNumber,
          purpose,
          achievements,
          recommendations,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          userId
        }
      },
      include: {
        event: true
      }
    });

    res.status(201).json({ message: 'Certificate generated successfully', certificate });
  } catch (error) {
    console.error('Create SK certificate error:', error);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
};

export const getSKCertificates = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId, userId } = req.query;

    let where: any = { eventId: { not: null } };
    
    if (eventId) {
      where.eventId = eventId as string;
    }
    
    if (userId) {
      where.certificateData = {
        path: ['userId'],
        equals: userId as string
      };
    }

    const certificates = await prisma.certificate.findMany({
      where,
      include: {
        event: true
      },
      orderBy: { issuedDate: 'desc' }
    });

    const transformedCertificates = certificates.map(cert => {
      const data = cert.certificateData as any;
      return {
        id: cert.id,
        certificateType: cert.certificateType,
        issuedDate: cert.issuedDate,
        issuedBy: cert.issuedBy,
        event: cert.event,
        certificateNumber: data?.certificateNumber || 'N/A',
        purpose: data?.purpose || cert.issuedFor,
        achievements: data?.achievements,
        recommendations: data?.recommendations,
        expiryDate: data?.expiryDate,
        userId: data?.userId
      };
    });

    res.json({ certificates: transformedCertificates });
  } catch (error) {
    console.error('Get SK certificates error:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
};

export const downloadSKCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        event: true
      }
    });

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const data = certificate.certificateData as any;
    const certificateData = {
      recipientName: certificate.recipientName,
      certificateType: certificate.certificateType,
      issuedFor: certificate.issuedFor,
      issuedDate: certificate.issuedDate.toISOString(),
      issuedBy: certificate.issuedBy,
      certificateNumber: data?.certificateNumber,
      purpose: data?.purpose,
      achievements: data?.achievements,
      recommendations: data?.recommendations,
      eventTitle: certificate.event?.title,
      eventDate: certificate.event?.eventDate?.toISOString()
    };

    console.log('Generating certificate PDF for:', certificate.recipientName);
    const pdfBuffer = await generateCertificatePDF(certificateData);
    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="sk-certificate-${certificate.recipientName.replace(/\s+/g, '-')}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Download SK certificate error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      error: 'Failed to generate certificate',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateSKCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      certificateType,
      certificateNumber,
      purpose,
      achievements,
      recommendations,
      expiryDate,
      issuedBy
    } = req.body;

    const certificate = await prisma.certificate.findUnique({
      where: { id }
    });

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Fetch the issuer's name if issuedBy is provided
    let issuedByName = issuedBy;
    if (issuedBy) {
      const issuer = await prisma.user.findUnique({
        where: { id: issuedBy }
      });
      if (issuer) {
        issuedByName = `${issuer.firstName} ${issuer.lastName}`;
      }
    }

    const data = certificate.certificateData as any;
    const updatedCertificate = await prisma.certificate.update({
      where: { id },
      data: {
        certificateType: certificateType || certificate.certificateType,
        issuedFor: purpose || certificate.issuedFor,
        issuedBy: issuedByName || certificate.issuedBy,
        certificateData: {
          ...data,
          certificateNumber,
          purpose,
          achievements,
          recommendations,
          expiryDate: expiryDate ? new Date(expiryDate) : null
        }
      },
      include: {
        event: true
      }
    });

    res.json({ message: 'Certificate updated successfully', certificate: updatedCertificate });
  } catch (error) {
    console.error('Update SK certificate error:', error);
    res.status(500).json({ error: 'Failed to update certificate' });
  }
};

export const deleteSKCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const certificate = await prisma.certificate.findUnique({
      where: { id }
    });

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    await prisma.certificate.delete({
      where: { id }
    });

    res.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('Delete SK certificate error:', error);
    res.status(500).json({ error: 'Failed to delete certificate' });
  }
};