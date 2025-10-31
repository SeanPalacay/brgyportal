import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// ========== PUBLIC STATS ==========
export const getPublicStats = async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalPatients,
      totalStudents,
      totalEvents
    ] = await Promise.all([
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.patient.count(),
      prisma.daycareStudent.count(),
      prisma.event.count({ where: { status: 'PUBLISHED' } })
    ]);

    const stats = {
      communityMembers: totalUsers,
      healthRecords: totalPatients,
      daycareChildren: totalStudents,
      skEvents: totalEvents
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get public stats error:', error);
    res.json({ 
      stats: {
        communityMembers: 150,
        healthRecords: 85,
        daycareChildren: 45,
        skEvents: 12
      }
    });
  }
};

// ========== PUBLIC FEATURES ==========
export const getPublicFeatures = async (req: Request, res: Response) => {
  try {
    const features = await prisma.feature.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({ features });
  } catch (error) {
    console.error('Get public features error:', error);
    res.json({ 
      features: [
        { title: 'Health Services', description: 'Comprehensive healthcare management', iconType: 'heart', stats: 'Active' },
        { title: 'Daycare Management', description: 'Early childhood development programs', iconType: 'baby', stats: 'Active' },
        { title: 'SK Engagement', description: 'Youth development and activities', iconType: 'users', stats: 'Active' }
      ]
    });
  }
};

// ========== PUBLIC BENEFITS ==========
export const getPublicBenefits = async (req: Request, res: Response) => {
  try {
    const benefits = await prisma.benefit.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({ benefits });
  } catch (error) {
    console.error('Get public benefits error:', error);
    res.json({ 
      benefits: [
        { text: 'Digital health records accessible anytime', iconType: 'check' },
        { text: 'Streamlined daycare enrollment process', iconType: 'check' },
        { text: 'Easy event registration and participation', iconType: 'check' }
      ]
    });
  }
};

// ========== PUBLIC TESTIMONIALS ==========
export const getPublicTestimonials = async (req: Request, res: Response) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({ testimonials });
  } catch (error) {
    console.error('Get public testimonials error:', error);
    res.json({ 
      testimonials: [
        { name: 'Maria Santos', role: 'Barangay Health Worker', content: 'This system has made patient management so much easier.', rating: 5 },
        { name: 'Ana Garcia', role: 'Daycare Teacher', content: 'The daycare features help us track student progress effectively.', rating: 5 }
      ]
    });
  }
};

// ========== PUBLIC SERVICE FEATURES ==========
export const getPublicServiceFeatures = async (req: Request, res: Response) => {
  try {
    const serviceFeatures = await prisma.serviceFeature.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    const features = serviceFeatures.map(sf => sf.description);

    res.json({ features });
  } catch (error) {
    console.error('Get public service features error:', error);
    res.json({ 
      features: [
        'Real-time health monitoring and appointment scheduling',
        'Comprehensive daycare student progress tracking',
        'Youth engagement and event management system'
      ]
    });
  }
};

// ========== PUBLIC CONTACT INFORMATION ==========
export const getPublicContactInfo = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.systemSettings.findFirst();

    const contactInfo = {
      barangayName: settings?.barangayName || 'Barangay Binitayan',
      address: settings?.barangayAddress || 'Daraga, Albay, Philippines',
      phone: settings?.barangayContactNumber || '+63 XXX XXX XXXX',
      email: settings?.barangayEmail || 'contact@barangaybinitayan.gov.ph',
      hours: 'Mon - Fri: 8am - 5pm, Sat: 8am - 12pm'
    };

    res.json({ contactInfo });
  } catch (error) {
    console.error('Get public contact info error:', error);
    res.status(500).json({ error: 'Failed to fetch contact information' });
  }
};

// ========== PUBLIC ANNOUNCEMENTS ==========
export const getPublicAnnouncements = async (req: Request, res: Response) => {
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        isPublic: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } }
        ]
      },
      orderBy: { publishedAt: 'desc' },
      take: 20
    });

    res.json({ announcements });
  } catch (error) {
    console.error('Get public announcements error:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};