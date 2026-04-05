import { Box, Flex, Text, Progress, Stack } from '@mantine/core';

interface ProgressBarProps {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  nextStepLabel: string;
}

export function ProgressBar({
  step,
  totalSteps,
  title,
  description,
  nextStepLabel,
}: ProgressBarProps) {
  const progress = (step / totalSteps) * 100;
  return (
    <Box
      mb={{
        base: 24,
        md: 40,
      }}
    >
      <Flex
        justify="space-between"
        align="flex-start"
        mb="xl"
        direction={{
          base: 'column',
          sm: 'row',
        }}
        gap={{
          base: 'md',
          sm: 0,
        }}
      >
        <Stack
          gap={8}
          style={{
            flex: 1,
          }}
        >
          <Text size="xs" fw={500} c="#64748B" tt="uppercase" style={{ letterSpacing: 1.2 }}>
            Step {step} of {totalSteps}
          </Text>
          <Text
            size="xl"
            fw={700}
            c="#0F172A"
            ff="Manrope"
            style={{
              fontSize: 'clamp(20px, 4vw, 30px)',
            }}
          >
            {title}
          </Text>
          <Text
            size="md"
            c="#475569"
            style={{
              fontSize: 'clamp(14px, 2.5vw, 16px)',
            }}
          >
            {description}
          </Text>
        </Stack>

        <Stack
          gap={4}
          style={{
            alignItems: 'flex-end',
          }}
          mt={{
            base: 'sm',
            sm: 0,
          }}
        >
          <Text size="sm" fw={700} c="#136DEC" ff="Manrope">
            {Math.round(progress)}% Complete
          </Text>
          <Text size="xs" c="#64748B" ff="Manrope">
            Next: {nextStepLabel}
          </Text>
        </Stack>
      </Flex>

      <Progress value={progress} size="sm" radius="xl" color="#136DEC" bg="#F1F5F9" />

      <Flex justify="space-between" mt="sm" gap="xs" wrap="wrap">
        <Text
          size="xs"
          fw={step >= 1 ? 600 : 400}
          c={step >= 1 ? '#136DEC' : '#94A3B8'}
          style={{ whiteSpace: 'nowrap' }}
        >
          Personal Info
        </Text>
        <Text
          size="xs"
          fw={step >= 2 ? 600 : 400}
          c={step >= 2 ? '#136DEC' : '#94A3B8'}
          style={{ whiteSpace: 'nowrap' }}
        >
          Experience
        </Text>
        <Text
          size="xs"
          fw={step >= 3 ? 600 : 400}
          c={step >= 3 ? '#136DEC' : '#94A3B8'}
          style={{ whiteSpace: 'nowrap' }}
        >
          Education
        </Text>
        <Text
          size="xs"
          fw={step >= 4 ? 600 : 400}
          c={step >= 4 ? '#136DEC' : '#94A3B8'}
          style={{ whiteSpace: 'nowrap' }}
        >
          Skills
        </Text>
      </Flex>
    </Box>
  );
}
