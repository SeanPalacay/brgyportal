import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';
import { generateCertificatePDF } from '../utils/certificateGenerator';

// ========== PATIENT MANAGEMENT ==========

export const createPatient = async (req: AuthRequest, res: Response) => {
  try {
    const patientData = req.body;

    // Extract guardianUserId separately to avoid passing it directly to Prisma
    const { guardianUserId, ...patientFields } = patientData;

    // Convert string values to appropriate types
    const processedData = {
      ...patientFields,
      dateOfBirth: new Date(patientFields.dateOfBirth),
      birthWeight: patientFields.birthWeight ? parseFloat(patientFields.birthWeight) : null,
      birthLength: patientFields.birthLength ? parseFloat(patientFields.birthLength) : null,
      guardianUserId: guardianUserId || null
    };

    const patient = await prisma.patient.create({
      data: processedData
    });

    res.status(201).json({ message: 'Patient created successfully', patient });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ error: 'Failed to create patient' });
  }
};

export const getAllPatients = async (req: AuthRequest, res: Response) => {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            appointments: true,
            immunizationRecords: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ patients });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
};

export const getPatientById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        appointments: {
          orderBy: { appointmentDate: 'desc' },
          take: 10
        },
        immunizationRecords: {
          orderBy: { dateGiven: 'desc' }
        }
      }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ patient });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
};

export const updatePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const patient = await prisma.patient.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.dateOfBirth && { dateOfBirth: new Date(updateData.dateOfBirth) })
      }
    });

    res.json({ message: 'Patient updated successfully', patient });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
};

export const deletePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.patient.delete({
      where: { id }
    });

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
};

// ========== APPOINTMENT MANAGEMENT ==========

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, appointmentDate, appointmentType, notes } = req.body;
    const healthWorkerId = req.user!.userId;

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        healthWorkerId,
        appointmentDate: new Date(appointmentDate),
        appointmentType,
        notes
      },
      include: {
        patient: true,
        healthWorker: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json({ message: 'Appointment created successfully', appointment });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
};

export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: true,
        healthWorker: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { appointmentDate: 'desc' }
    });

    res.json({ appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

export const getAppointmentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        healthWorker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            roles: true
          }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ appointment });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status,
        ...(notes && { notes })
      },
      include: {
        patient: true
      }
    });

    res.json({ message: 'Appointment status updated', appointment });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
};

export const updateAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { patientId, appointmentDate, appointmentType, notes } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...(patientId && { patientId }),
        ...(appointmentDate && { appointmentDate: new Date(appointmentDate) }),
        ...(appointmentType && { appointmentType }),
        ...(notes !== undefined && { notes })
      },
      include: {
        patient: true,
        healthWorker: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({ message: 'Appointment updated successfully', appointment });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
};

export const deleteAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.appointment.delete({
      where: { id }
    });

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
};

export const getMyAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Find patient linked to this user
    const patient = await prisma.patient.findFirst({
      where: { userId }
    });

    if (!patient) {
      return res.json({ appointments: [] });
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: {
        healthWorker: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { appointmentDate: 'desc' }
    });

    res.json({ appointments });
  } catch (error) {
    console.error('Get my appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

// ========== IMMUNIZATION RECORDS ==========

export const createImmunizationRecord = async (req: AuthRequest, res: Response) => {
  try {
    const {
      patientId,
      vaccineName,
      vaccineType,
      manufacturer,
      lotNumber,
      dosage,
      dateGiven,
      ageAtVaccination,
      siteOfAdministration,
      administeredBy,
      doseNumber,
      nextDueDate,
      batchNumber,
      expirationDate,
      adverseReactions,
      notes
    } = req.body;

    const recordedBy = req.user!.userId;

    const immunizationRecord = await prisma.immunizationRecord.create({
      data: {
        patientId,
        vaccineName,
        vaccineType,
        manufacturer,
        lotNumber,
        dosage,
        dateGiven: new Date(dateGiven),
        ageAtVaccination,
        siteOfAdministration,
        administeredBy,
        doseNumber,
        nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
        batchNumber,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        adverseReactions,
        recordedBy,
        notes
      },
      include: {
        patient: true
      }
    });

    res.status(201).json({ message: 'Immunization record created successfully', immunizationRecord });
  } catch (error) {
    console.error('Create immunization record error:', error);
    res.status(500).json({ error: 'Failed to create immunization record' });
  }
};

export const getImmunizationRecords = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.query;

    const where = patientId ? { patientId: patientId as string } : {};

    const immunizationRecords = await prisma.immunizationRecord.findMany({
      where,
      include: {
        patient: true
      },
      orderBy: { dateGiven: 'desc' }
    });

    res.json({ immunizationRecords });
  } catch (error) {
    console.error('Get immunization records error:', error);
    res.status(500).json({ error: 'Failed to fetch immunization records' });
  }
};

export const getImmunizationSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const schedule = await prisma.immunizationSchedule.findMany({
      orderBy: [{ ageInDays: 'asc' }, { doseNumber: 'asc' }]
    });

    res.json({ schedule });
  } catch (error) {
    console.error('Get immunization schedule error:', error);
    res.status(500).json({ error: 'Failed to fetch immunization schedule' });
  }
};

export const getPatientImmunizationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        immunizationRecords: {
          orderBy: { dateGiven: 'desc' }
        }
      }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Calculate age in days
    const ageInDays = Math.floor((Date.now() - patient.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24));

    // Get recommended schedule for patient's age
    const recommendedSchedule = await prisma.immunizationSchedule.findMany({
      where: {
        ageInDays: { lte: ageInDays }
      },
      orderBy: [{ ageInDays: 'asc' }, { doseNumber: 'asc' }]
    });

    // Check completion status
    const completionStatus = recommendedSchedule.map(schedule => {
      const completed = patient.immunizationRecords.find(record => 
        record.vaccineName === schedule.vaccineName && 
        record.doseNumber === schedule.doseNumber
      );
      
      return {
        ...schedule,
        completed: !!completed,
        completedDate: completed?.dateGiven || null
      };
    });

    res.json({ 
      patient, 
      ageInDays, 
      completionStatus,
      totalRequired: recommendedSchedule.length,
      totalCompleted: completionStatus.filter(s => s.completed).length
    });
  } catch (error) {
    console.error('Get patient immunization status error:', error);
    res.status(500).json({ error: 'Failed to fetch immunization status' });
  }
};

// ========== HEALTH RECORDS (Legacy) ==========

export const createHealthRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, vaccineName, vaccineType, administeredBy, notes } = req.body;
    const recordedBy = req.user!.userId;

    const healthRecord = await prisma.immunizationRecord.create({
      data: {
        patientId,
        dateGiven: new Date(),
        vaccineName: vaccineName || 'General Health Record',
        vaccineType: vaccineType || 'HEALTH_RECORD',
        administeredBy: administeredBy || recordedBy,
        recordedBy,
        notes
      },
      include: {
        patient: true
      }
    });

    res.status(201).json({ message: 'Health record created successfully', healthRecord });
  } catch (error) {
    console.error('Create health record error:', error);
    res.status(500).json({ error: 'Failed to create health record' });
  }
};

export const getHealthRecords = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.query;

    const where = patientId ? { patientId: patientId as string } : {};

    const healthRecords = await prisma.immunizationRecord.findMany({
      where,
      include: {
        patient: true
      },
      orderBy: { dateGiven: 'desc' }
    });

    res.json({ healthRecords });
  } catch (error) {
    console.error('Get health records error:', error);
    res.status(500).json({ error: 'Failed to fetch health records' });
  }
};

export const getMyHealthRecords = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Find patient linked to this user
    const patient = await prisma.patient.findFirst({
      where: { userId }
    });

    if (!patient) {
      return res.json({ immunizationRecords: [], healthRecords: [] });
    }

    const healthRecords = await prisma.immunizationRecord.findMany({
      where: { patientId: patient.id },
      orderBy: { dateGiven: 'desc' }
    });

    const immunizationRecords = await prisma.immunizationRecord.findMany({
      where: { patientId: patient.id },
      orderBy: { dateGiven: 'desc' }
    });

    // For backward compatibility, also return as 'vaccinations'
    res.json({ 
      healthRecords, 
      immunizationRecords, 
      vaccinations: immunizationRecords, 
      patient 
    });
  } catch (error) {
    console.error('Get my health records error:', error);
    res.status(500).json({ error: 'Failed to fetch health records' });
  }
};

export const getMyImmunizationRecords = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Find patient linked to this user
    const patient = await prisma.patient.findFirst({
      where: { userId }
    });

    if (!patient) {
      return res.json({ immunizationRecords: [] });
    }

    const immunizationRecords = await prisma.immunizationRecord.findMany({
      where: { patientId: patient.id },
      include: {
        patient: true
      },
      orderBy: { dateGiven: 'desc' }
    });

    res.json({ immunizationRecords });
  } catch (error) {
    console.error('Get my immunization records error:', error);
    res.status(500).json({ error: 'Failed to fetch immunization records' });
  }
};

// ========== VACCINATION MANAGEMENT (Legacy - Use ImmunizationRecord instead) ==========
// Note: These endpoints redirect to immunization records for consistency

export const createVaccination = async (req: AuthRequest, res: Response) => {
  // Redirect to immunization record creation for consistency
  return createImmunizationRecord(req, res);
};

export const getVaccinations = async (req: AuthRequest, res: Response) => {
  // Redirect to immunization records for consistency
  return getImmunizationRecords(req, res);
};

export const getUpcomingVaccinations = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();

    const immunizationRecords = await prisma.immunizationRecord.findMany({
      where: {
        nextDueDate: {
          gte: today
        }
      },
      include: {
        patient: true
      },
      orderBy: { nextDueDate: 'asc' }
    });

    res.json({ vaccinations: immunizationRecords }); // Keep 'vaccinations' key for backward compatibility
  } catch (error) {
    console.error('Get upcoming immunizations error:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming immunizations' });
  }
};

// ========== CERTIFICATE MANAGEMENT ==========

export const createCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const {
      patientId,
      certificateType,
      certificateNumber,
      purpose,
      findings,
      recommendations,
      expiryDate,
      issuedBy
    } = req.body;

    // Get patient info for recipient name
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
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
        patientId,
        certificateType,
        recipientName: `${patient.firstName} ${patient.lastName}`,
        issuedFor: purpose || certificateType,
        issuedBy: issuedByName,
        certificateData: {
          certificateNumber,
          purpose,
          findings,
          recommendations,
          expiryDate: expiryDate ? new Date(expiryDate) : null
        }
      },
      include: {
        patient: true
      }
    });

    res.status(201).json({ message: 'Certificate generated successfully', certificate });
  } catch (error) {
    console.error('Create certificate error:', error);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
};

export const getCertificates = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.query;

    const where = patientId ? { patientId: patientId as string } : { patientId: { not: null } };

    const certificates = await prisma.certificate.findMany({
      where,
      include: {
        patient: true
      },
      orderBy: { issuedDate: 'desc' }
    });

    // Transform certificates to match frontend expectations
    const transformedCertificates = certificates.map(cert => {
      const data = cert.certificateData as any;
      return {
        id: cert.id,
        certificateType: cert.certificateType,
        issuedDate: cert.issuedDate,
        issuedBy: cert.issuedBy,
        patient: cert.patient,
        certificateNumber: data?.certificateNumber || 'N/A',
        purpose: data?.purpose || cert.issuedFor,
        findings: data?.findings,
        recommendations: data?.recommendations,
        expiryDate: data?.expiryDate
      };
    });

    res.json({ certificates: transformedCertificates });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
};

export const downloadCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        patient: true
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
      achievements: data?.findings,
      recommendations: data?.recommendations,
      patientInfo: certificate.patient
    };

    console.log('Generating health certificate PDF for:', certificate.recipientName);
    const pdfBuffer = await generateCertificatePDF(certificateData);
    console.log('Health PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${certificate.recipientName.replace(/\s+/g, '-')}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Download certificate error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      error: 'Failed to generate certificate',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      certificateType,
      certificateNumber,
      purpose,
      findings,
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

    const updatedCertificate = await prisma.certificate.update({
      where: { id },
      data: {
        certificateType: certificateType || certificate.certificateType,
        issuedFor: purpose || certificate.issuedFor,
        issuedBy: issuedByName || certificate.issuedBy,
        certificateData: {
          certificateNumber,
          purpose,
          findings,
          recommendations,
          expiryDate: expiryDate ? new Date(expiryDate) : null
        }
      },
      include: {
        patient: true
      }
    });

    res.json({ message: 'Certificate updated successfully', certificate: updatedCertificate });
  } catch (error) {
    console.error('Update certificate error:', error);
    res.status(500).json({ error: 'Failed to update certificate' });
  }
};

export const deleteCertificate = async (req: AuthRequest, res: Response) => {
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
    console.error('Delete certificate error:', error);
    res.status(500).json({ error: 'Failed to delete certificate' });
  }
};
