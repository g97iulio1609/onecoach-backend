/**
 * Body Measurements Service
 *
 * CRUD operations for body measurements tracking.
 * Follows SOLID principles with single responsibility.
 */
import 'server-only';
import { prisma } from '@onecoach/lib-core/prisma';
import { Prisma } from '@prisma/client';
// Decimal is available from Prisma namespace
const { Decimal } = Prisma;
// ============================================
// HELPERS
// ============================================
function normalizeBodyMeasurement(measurement) {
    const m = measurement;
    return {
        id: m.id,
        userId: m.userId,
        date: m.date instanceof Date ? m.date : new Date(m.date),
        weight: m.weight ? Number(m.weight) : undefined,
        bodyFat: m.bodyFat ? Number(m.bodyFat) : undefined,
        muscleMass: m.muscleMass ? Number(m.muscleMass) : undefined,
        chest: m.chest ? Number(m.chest) : undefined,
        waist: m.waist ? Number(m.waist) : undefined,
        hips: m.hips ? Number(m.hips) : undefined,
        thigh: m.thigh ? Number(m.thigh) : undefined,
        arm: m.arm ? Number(m.arm) : undefined,
        calf: m.calf ? Number(m.calf) : undefined,
        neck: m.neck ? Number(m.neck) : undefined,
        shoulders: m.shoulders ? Number(m.shoulders) : undefined,
        height: m.height ? Number(m.height) : undefined,
        visceralFat: m.visceralFat ? Number(m.visceralFat) : undefined,
        waterPercentage: m.waterPercentage ? Number(m.waterPercentage) : undefined,
        boneMass: m.boneMass ? Number(m.boneMass) : undefined,
        metabolicAge: m.metabolicAge ?? undefined,
        bmr: m.bmr ?? undefined,
        notes: m.notes || undefined,
        photos: m.photos,
        createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
        updatedAt: m.updatedAt instanceof Date ? m.updatedAt.toISOString() : m.updatedAt,
    };
}
function prepareDecimalField(value) {
    return value !== undefined ? new Decimal(value) : null;
}
// ============================================
// CREATE
// ============================================
export async function createBodyMeasurement(userId, data) {
    // Check if measurement already exists for this date
    const existing = await prisma.body_measurements.findFirst({
        where: {
            userId,
            date: data.date,
        },
    });
    if (existing) {
        throw new Error('A measurement already exists for this date');
    }
    const measurement = await prisma.body_measurements.create({
        data: {
            userId,
            date: data.date,
            weight: prepareDecimalField(data.weight),
            bodyFat: prepareDecimalField(data.bodyFat),
            muscleMass: prepareDecimalField(data.muscleMass),
            chest: prepareDecimalField(data.chest),
            waist: prepareDecimalField(data.waist),
            hips: prepareDecimalField(data.hips),
            thigh: prepareDecimalField(data.thigh),
            arm: prepareDecimalField(data.arm),
            calf: prepareDecimalField(data.calf),
            neck: prepareDecimalField(data.neck),
            shoulders: prepareDecimalField(data.shoulders),
            height: prepareDecimalField(data.height),
            visceralFat: prepareDecimalField(data.visceralFat),
            waterPercentage: prepareDecimalField(data.waterPercentage),
            boneMass: prepareDecimalField(data.boneMass),
            metabolicAge: data.metabolicAge,
            bmr: data.bmr,
            notes: data.notes,
            photos: data.photos || [],
        },
    });
    return normalizeBodyMeasurement(measurement);
}
// ============================================
// READ
// ============================================
export async function getBodyMeasurement(userId, date) {
    const measurement = await prisma.body_measurements.findFirst({
        where: {
            userId,
            date,
        },
    });
    if (!measurement)
        return null;
    return normalizeBodyMeasurement(measurement);
}
export async function getBodyMeasurementById(measurementId, userId) {
    const measurement = await prisma.body_measurements.findUnique({
        where: { id: measurementId },
    });
    if (!measurement || measurement.userId !== userId) {
        return null;
    }
    return normalizeBodyMeasurement(measurement);
}
export async function getBodyMeasurementHistory(userId, startDate, endDate, limit) {
    const measurements = await prisma.body_measurements.findMany({
        where: {
            userId,
            ...(startDate || endDate
                ? {
                    date: {
                        ...(startDate && { gte: startDate }),
                        ...(endDate && { lte: endDate }),
                    },
                }
                : {}),
        },
        orderBy: { date: 'desc' },
        ...(limit && { take: limit }),
    });
    return measurements.map(normalizeBodyMeasurement);
}
export async function getLatestBodyMeasurement(userId) {
    const measurement = await prisma.body_measurements.findFirst({
        where: { userId },
        orderBy: { date: 'desc' },
    });
    if (!measurement)
        return null;
    return normalizeBodyMeasurement(measurement);
}
// ============================================
// UPDATE
// ============================================
export async function updateBodyMeasurement(measurementId, userId, data) {
    // Verify ownership
    const existing = await prisma.body_measurements.findUnique({
        where: { id: measurementId },
    });
    if (!existing || existing.userId !== userId) {
        throw new Error('Measurement not found or unauthorized');
    }
    // If date is being changed, check for conflicts
    if (data.date && data.date.getTime() !== existing.date.getTime()) {
        const conflict = await prisma.body_measurements.findFirst({
            where: {
                userId,
                date: data.date,
            },
        });
        if (conflict && conflict.id !== measurementId) {
            throw new Error('A measurement already exists for this date');
        }
    }
    const measurement = await prisma.body_measurements.update({
        where: { id: measurementId },
        data: {
            ...(data.date && { date: data.date }),
            ...(data.weight !== undefined && { weight: prepareDecimalField(data.weight) }),
            ...(data.bodyFat !== undefined && { bodyFat: prepareDecimalField(data.bodyFat) }),
            ...(data.muscleMass !== undefined && { muscleMass: prepareDecimalField(data.muscleMass) }),
            ...(data.chest !== undefined && { chest: prepareDecimalField(data.chest) }),
            ...(data.waist !== undefined && { waist: prepareDecimalField(data.waist) }),
            ...(data.hips !== undefined && { hips: prepareDecimalField(data.hips) }),
            ...(data.thigh !== undefined && { thigh: prepareDecimalField(data.thigh) }),
            ...(data.arm !== undefined && { arm: prepareDecimalField(data.arm) }),
            ...(data.calf !== undefined && { calf: prepareDecimalField(data.calf) }),
            ...(data.neck !== undefined && { neck: prepareDecimalField(data.neck) }),
            ...(data.shoulders !== undefined && { shoulders: prepareDecimalField(data.shoulders) }),
            ...(data.height !== undefined && { height: prepareDecimalField(data.height) }),
            ...(data.visceralFat !== undefined && { visceralFat: prepareDecimalField(data.visceralFat) }),
            ...(data.waterPercentage !== undefined && { waterPercentage: prepareDecimalField(data.waterPercentage) }),
            ...(data.boneMass !== undefined && { boneMass: prepareDecimalField(data.boneMass) }),
            ...(data.metabolicAge !== undefined && { metabolicAge: data.metabolicAge }),
            ...(data.bmr !== undefined && { bmr: data.bmr }),
            ...(data.notes !== undefined && { notes: data.notes }),
            ...(data.photos !== undefined && { photos: data.photos }),
        },
    });
    return normalizeBodyMeasurement(measurement);
}
// ============================================
// DELETE
// ============================================
export async function deleteBodyMeasurement(measurementId, userId) {
    // Verify ownership
    const existing = await prisma.body_measurements.findUnique({
        where: { id: measurementId },
    });
    if (!existing || existing.userId !== userId) {
        throw new Error('Measurement not found or unauthorized');
    }
    await prisma.body_measurements.delete({
        where: { id: measurementId },
    });
}
// ============================================
// STATISTICS
// ============================================
export async function getBodyMeasurementStats(userId, startDate, endDate) {
    const measurements = await prisma.body_measurements.findMany({
        where: {
            userId,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        orderBy: { date: 'asc' },
    });
    if (measurements.length === 0) {
        return null;
    }
    const first = measurements[0];
    const last = measurements[measurements.length - 1];
    if (!first || !last) {
        return null;
    }
    return {
        totalMeasurements: measurements.length,
        firstDate: first.date,
        lastDate: last.date,
        changes: {
            weight: first.weight && last.weight ? Number(last.weight) - Number(first.weight) : undefined,
            bodyFat: first.bodyFat && last.bodyFat ? Number(last.bodyFat) - Number(first.bodyFat) : undefined,
            muscleMass: first.muscleMass && last.muscleMass
                ? Number(last.muscleMass) - Number(first.muscleMass)
                : undefined,
        },
        latest: normalizeBodyMeasurement(last),
    };
}
