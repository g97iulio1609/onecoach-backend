import { PrismaClient } from '@prisma/client';

import { logger } from '@onecoach/lib-core';
const staticModels = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    supportsImages: true,
    supportsReasoning: false,
    supportsStructuredOutput: true,
    contextLength: 1000000,
    promptPrice: 0.075, // Approximate
    completionPrice: 0.3,
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    supportsImages: true,
    supportsReasoning: true,
    supportsStructuredOutput: true,
    contextLength: 2000000,
    promptPrice: 1.25,
    completionPrice: 5.0,
  },
  {
    id: 'claude-4-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    supportsImages: false,
    supportsReasoning: false,
    supportsStructuredOutput: true,
    contextLength: 200000,
    promptPrice: 0.25,
    completionPrice: 1.25,
  },
  {
    id: 'claude-4-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    supportsImages: true,
    supportsReasoning: true,
    supportsStructuredOutput: true,
    contextLength: 200000,
    promptPrice: 3.0,
    completionPrice: 15.0,
  },
  {
    id: 'gpt-5-medium',
    name: 'GPT-4o', // Mapping 5-medium to 4o for now as per common usage
    provider: 'openai',
    supportsImages: true,
    supportsReasoning: false,
    supportsStructuredOutput: true,
    contextLength: 128000,
    promptPrice: 2.5,
    completionPrice: 10.0,
  },
  {
    id: 'gpt-5-high',
    name: 'GPT-4o High',
    provider: 'openai',
    supportsImages: true,
    supportsReasoning: true,
    supportsStructuredOutput: true,
    contextLength: 128000,
    promptPrice: 5.0,
    completionPrice: 15.0,
  },
  {
    id: 'grok-4-fast',
    name: 'Grok Beta',
    provider: 'xai',
    supportsImages: false,
    supportsReasoning: false,
    supportsStructuredOutput: true,
    contextLength: 128000,
    promptPrice: 5.0,
    completionPrice: 15.0,
  },
  {
    id: 'grok-4',
    name: 'Grok 2',
    provider: 'xai',
    supportsImages: true,
    supportsReasoning: true,
    supportsStructuredOutput: true,
    contextLength: 128000,
    promptPrice: 5.0,
    completionPrice: 15.0,
  },
];

export async function seedStaticModels(prisma: PrismaClient) {
  logger.warn('Seeding static AI models to ai_external_models...');

  for (const model of staticModels) {
    await prisma.ai_external_models.upsert({
      where: { modelId: model.id },
      update: {
        name: model.name,
        provider: model.provider,
        supportsImages: model.supportsImages,
        supportsReasoning: model.supportsReasoning,
        supportsStructuredOutput: model.supportsStructuredOutput,
        contextLength: model.contextLength,
        promptPrice: model.promptPrice,
        completionPrice: model.completionPrice,
        isActive: true,
      },
      create: {
        modelId: model.id,
        name: model.name,
        provider: model.provider,
        supportsImages: model.supportsImages,
        supportsReasoning: model.supportsReasoning,
        supportsStructuredOutput: model.supportsStructuredOutput,
        contextLength: model.contextLength,
        promptPrice: model.promptPrice,
        completionPrice: model.completionPrice,
        isActive: true,
      },
    });
  }

  logger.warn('Seeding complete.');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedStaticModels(prisma)
    .catch((e: unknown) => {
      logger.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
