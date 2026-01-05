import { prisma } from '@onecoach/lib-core/prisma';
import { createId } from '@onecoach/lib-shared/utils';
import { ImportOptionsSchema, IMPORT_LIMITS as WORKOUT_LIMITS } from '../schemas/imported-workout.schema';
import { FileValidatorService } from './file-validator.service';
import { FileParserService } from './file-parser.service';
import { ExerciseMatcherService } from './exercise-matcher.service';
import { BaseImportService } from '@onecoach/lib-import-core';
/**
 * Workout Import Service
 *
 * Extends BaseImportService with:
 * - TAIRaw = ImportedWorkoutProgram (what AI returns)
 * - TParsed = ParsedWorkoutData (wrapped with warnings/stats)
 * - TResult = WorkoutImportResult
 */
export class WorkoutImportService extends BaseImportService {
    getLoggerName() {
        return 'WorkoutImportService';
    }
    // Override validateFiles to add domain-specific checks
    validateFiles(files) {
        // Basic validation
        super.validateFiles(files);
        // Check rate limit
        const rateLimit = FileValidatorService.checkRateLimit(this.context.userId);
        if (!rateLimit.allowed) {
            const resetMinutes = Math.ceil(rateLimit.resetIn / 60000);
            throw new Error(`Limite import raggiunto. Riprova tra ${resetMinutes} minuti.`);
        }
        // Advanced validation
        const validation = FileValidatorService.validateFiles(files);
        if (!validation.valid) {
            throw new Error(validation.totalErrors.join('\n'));
        }
        this.logger.info('File validation completed', {
            requestId: this.context.requestId,
            totalFiles: files.length,
        });
    }
    // Cache for parsing stats to pass to processParsed
    parsingWarnings = [];
    parsingErrors = [];
    parsingStats = { filesProcessed: 0, parsingWarnings: 0, parsingErrors: 0 };
    // Override parseFiles to handle multiple files and use FileParserService
    // Returns ImportedWorkoutProgram (TAIRaw) - the raw combined program
    async parseFiles(files, options) {
        const importOptions = ImportOptionsSchema.parse({
            ...options,
            matchThreshold: options?.matchThreshold ?? 0.8,
        });
        const parseResults = await FileParserService.parseFiles(files, importOptions, this.aiContext // FileParserService uses its own AIContext format
        );
        // Reset and populate parsing warnings/errors for processParsed
        this.parsingWarnings = [];
        this.parsingErrors = [];
        for (const error of parseResults.errors) {
            this.parsingErrors.push(`${error.fileName}: ${error.error}`);
        }
        for (const warning of parseResults.warnings) {
            this.parsingWarnings.push(...warning.warnings.map((w) => `${warning.fileName}: ${w}`));
        }
        if (parseResults.programs.length === 0) {
            throw new Error('Nessun programma è stato estratto dai file');
        }
        const combinedProgram = FileParserService.combinePrograms(parseResults.programs);
        // Cache stats for processParsed
        this.parsingStats = {
            filesProcessed: parseResults.programs.length,
            parsingWarnings: this.parsingWarnings.length,
            parsingErrors: this.parsingErrors.length,
        };
        // Return raw ImportedWorkoutProgram (TAIRaw)
        return combinedProgram;
    }
    // Implementation is unused due to override
    buildPrompt(_options) {
        return '';
    }
    async processParsed(parsed, // TAIRaw - raw AI output
    userId, options) {
        // parsed is the raw ImportedWorkoutProgram from parseFiles
        // We wrap it into ParsedWorkoutData using cached warnings/errors
        const combinedProgram = parsed;
        const importOptions = ImportOptionsSchema.parse(options || {});
        // Step 3: Matching esercizi
        this.emit({
            step: 'matching',
            message: 'Matching esercizi con database...',
            progress: 0,
        });
        const allExercises = [];
        for (const week of combinedProgram.weeks) {
            for (const day of week.days) {
                allExercises.push(...day.exercises);
            }
        }
        const matches = await ExerciseMatcherService.matchExercises(allExercises, importOptions.locale, importOptions.matchThreshold);
        const matchedExercises = ExerciseMatcherService.applyMatches(allExercises, matches);
        const matchedCount = matchedExercises.filter((e) => !e.notFound).length;
        const unmatchedCount = matchedExercises.filter((e) => e.notFound).length;
        const unmatchedNames = [
            ...new Set(matchedExercises.filter((e) => e.notFound).map((e) => e.name)),
        ];
        // Step 4: Review (pseudo-step)
        // If review mode, we should technically stop here?
        // BaseImportService doesn't support stopping/returning early easily without throwing?
        // Or we return a result that indicates "review required"?
        // If mode is review and unmatched > 0, we return early.
        // We can throw a special error or just return a result?
        // But processParsed returns 'unknown' passed to 'persist'.
        // If we want to return from 'import', we must bubble up.
        // We'll handle it by returning a special object that persist handles?
        // Or just proceed and handle review logic.
        const needsReview = importOptions.mode === 'review' && unmatchedCount > 0;
        if (needsReview) {
            // We package the data needed for review response
            return {
                combinedProgram,
                warnings: this.parsingWarnings,
                errors: this.parsingErrors,
                stats: this.parsingStats,
                needsReview: true,
                parseResult: {
                    program: combinedProgram,
                    warnings: this.parsingWarnings,
                    unmatchedExercises: unmatchedNames.map(name => ({
                        name,
                        suggestions: matches.get(name)?.suggestions || []
                    })),
                    stats: { ...this.parsingStats, matchedExercises: matchedCount, unmatchedExercises: unmatchedCount }
                },
            }; // Extended for review mode
        }
        // Step 5: Create missing
        let exercisesCreated = 0;
        if (importOptions.createMissingExercises && unmatchedCount > 0) {
            this.emit({
                step: 'matching', // using matching step for conversion UI
                message: 'Creazione esercizi mancanti...',
                progress: 0.8,
            });
            for (const name of unmatchedNames) {
                try {
                    const newId = await ExerciseMatcherService.createMissingExercise(name, combinedProgram.sourceFile || 'import', userId, importOptions.locale);
                    // Update matches
                    for (const exercise of matchedExercises) {
                        if (exercise.name === name) {
                            exercise.catalogExerciseId = newId;
                            exercise.notFound = false;
                        }
                    }
                    exercisesCreated++;
                }
                catch (err) {
                    const msg = `Impossibile creare esercizio "${name}": ${err}`;
                    this.parsingWarnings.push(msg);
                    this.logger.warn(msg);
                }
            }
        }
        // Apply matches back to program
        let exerciseIdx = 0;
        for (const week of combinedProgram.weeks) {
            for (const day of week.days) {
                for (let i = 0; i < day.exercises.length; i++) {
                    day.exercises[i] = matchedExercises[exerciseIdx];
                    exerciseIdx++;
                }
            }
        }
        const workoutProgram = this.convert(combinedProgram, userId);
        return {
            combinedProgram,
            workoutProgram,
            warnings: this.parsingWarnings,
            errors: this.parsingErrors,
            stats: {
                filesProcessed: this.parsingStats.filesProcessed,
                parsingWarnings: this.parsingStats.parsingWarnings,
                parsingErrors: this.parsingStats.parsingErrors,
            },
            importStats: {
                exercisesTotal: allExercises.length,
                exercisesMatched: matchedCount,
                exercisesCreated,
                weeksImported: workoutProgram.weeks.length,
                daysImported: workoutProgram.weeks.reduce((sum, w) => sum + w.days.length, 0),
                creditsUsed: WORKOUT_LIMITS.DEFAULT_CREDIT_COST,
            },
        };
    }
    async persist(processed, userId) {
        if (processed.needsReview) {
            // Return review result without persisting
            return {
                success: true,
                parseResult: processed.parseResult,
                warnings: processed.warnings,
                errors: processed.errors,
                stats: processed.parseResult.stats // Map appropriately
            };
        }
        const { workoutProgram, stats, warnings, errors } = processed;
        const result = await prisma.workout_programs.create({
            data: {
                id: workoutProgram.id,
                userId,
                name: workoutProgram.name,
                description: workoutProgram.description,
                difficulty: workoutProgram.difficulty,
                durationWeeks: workoutProgram.durationWeeks,
                goals: workoutProgram.goals,
                status: workoutProgram.status,
                weeks: workoutProgram.weeks,
                metadata: workoutProgram.metadata,
                version: workoutProgram.version || 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
        FileValidatorService.incrementRateLimit(userId);
        return {
            programId: result.id,
            program: workoutProgram,
            stats,
            warnings,
            errors
        };
    }
    createErrorResult(errors) {
        return {
            success: false,
            errors,
            stats: {
                filesProcessed: 0,
                exercisesTotal: 0,
                exercisesMatched: 0,
                exercisesCreated: 0,
                weeksImported: 0,
                daysImported: 0,
                creditsUsed: 0
            }
        };
    }
    // Helpers
    convert(imported, userId) {
        const now = new Date().toISOString();
        const programId = createId();
        const weeks = imported.weeks.map((week) => this.convertWeek(week));
        return {
            id: programId,
            name: imported.name,
            description: imported.description || `Imported from ${imported.sourceFile || 'file'}`,
            difficulty: imported.difficulty || 'INTERMEDIATE',
            durationWeeks: imported.durationWeeks || weeks.length,
            weeks,
            goals: imported.goals || [],
            status: 'DRAFT',
            userId,
            version: 1,
            metadata: {
                importedAt: now,
                sourceFile: imported.sourceFile,
                originalAuthor: imported.originalAuthor,
            },
            createdAt: now,
            updatedAt: now,
        };
    }
    convertWeek(imported) {
        return {
            weekNumber: imported.weekNumber,
            days: imported.days.map((day) => this.convertDay(day)),
            notes: imported.notes,
            focus: imported.focus,
        };
    }
    convertDay(imported) {
        return {
            dayNumber: imported.dayNumber,
            dayName: imported.name || `Day ${imported.dayNumber}`,
            name: imported.name || `Day ${imported.dayNumber}`,
            exercises: imported.exercises.map((ex) => this.convertExercise(ex)),
            totalDuration: imported.duration,
            notes: imported.notes || '',
            targetMuscles: imported.targetMuscles || [],
            warmup: imported.warmup,
            cooldown: imported.cooldown || '',
        };
    }
    convertExercise(imported) {
        const sets = imported.sets || 3;
        const reps = typeof imported.reps === 'number' ? imported.reps : 10;
        const weight = typeof imported.weight === 'number' ? imported.weight : null;
        const rest = imported.rest || 90;
        const baseSet = {
            reps,
            weight,
            weightLbs: weight ? weight * 2.20462 : null,
            rest,
            intensityPercent: imported.intensityPercent || null,
            rpe: imported.rpe || null,
        };
        const expandedSets = Array.from({ length: sets }, () => ({ ...baseSet }));
        const setGroup = {
            id: createId(),
            count: sets,
            baseSet,
            sets: expandedSets,
        };
        return {
            id: createId(),
            name: imported.name,
            description: imported.notes || '',
            category: 'strength',
            muscleGroups: [],
            setGroups: [setGroup],
            notes: imported.notes || '',
            typeLabel: '',
            repRange: typeof imported.reps === 'string' ? imported.reps : `${reps}`,
            formCues: [],
            equipment: imported.equipment || [],
            catalogExerciseId: imported.catalogExerciseId || '',
            videoUrl: undefined,
            variation: imported.variant ? { en: imported.variant } : undefined,
        };
    }
}
