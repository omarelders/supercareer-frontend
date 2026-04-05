import { Box, Stack, Text, Flex, Group } from '@mantine/core';
import { Mail, Phone, MapPin } from 'lucide-react';
import type { CVData } from '../types';

interface CVPreviewProps {
  data: CVData;
}

export function CVPreview({ data }: CVPreviewProps) {
  const { personal, experience, education, skills } = data;
  return (
    <Box
      bg="#F1F5F9"
      p={{
        base: 'md',
        sm: 'lg',
        md: 'xl',
      }}
      style={{
        borderRadius: 12,
        height: '100%',
        minHeight: 800,
      }}
    >
      <Box
        bg="white"
        p={{
          base: 20,
          sm: 30,
          md: 40,
        }}
        style={{
          borderRadius: 8,
          boxShadow: '0px 8px 20px -6px rgba(0,0,0,0.1)',
          minHeight: '100%',
        }}
      >
        {/* Header */}
        <Flex
          justify="space-between"
          align="flex-start"
          mb={32}
          direction={{
            base: 'column',
            sm: 'row',
          }}
          gap={{
            base: 'md',
            sm: 0,
          }}
        >
          <Stack gap={4}>
            <Text
              ff="Manrope"
              fw={800}
              size="xl"
              style={{
                fontSize: 'clamp(20px, 4vw, 32px)',
                textTransform: 'uppercase',
                letterSpacing: '-0.5px',
              }}
              c="#0F172A"
            >
              {personal.fullName || 'Alex Rivera'}
            </Text>
            <Text
              ff="Manrope"
              fw={800}
              size="sm"
              c="#135BEC"
              tt="uppercase"
              style={{ letterSpacing: 2 }}
            >
              {personal.title || 'Senior UX Designer'}
            </Text>
          </Stack>

          <Stack
            gap={8}
            style={{ alignItems: 'flex-start' }}
          >
            <Group gap={8} wrap="nowrap">
              <Mail size={12} color="#64748B" style={{ flexShrink: 0 }} />
              <Text
                size="xs"
                fw={600}
                c="#64748B"
                ff="Manrope"
                style={{ wordBreak: 'break-word', fontSize: 'clamp(10px, 2vw, 12px)' }}
              >
                {personal.email || 'alex.rivera@example.com'}
              </Text>
            </Group>
            <Group gap={8} wrap="nowrap">
              <Phone size={12} color="#64748B" style={{ flexShrink: 0 }} />
              <Text size="xs" fw={600} c="#64748B" ff="Manrope">
                {personal.phone || '+1 (555) 000-0000'}
              </Text>
            </Group>
            <Group gap={8} wrap="nowrap">
              <MapPin size={12} color="#64748B" style={{ flexShrink: 0 }} />
              <Text size="xs" fw={600} c="#64748B" ff="Manrope">
                {personal.location || 'San Francisco, CA'}
              </Text>
            </Group>
          </Stack>
        </Flex>

        {/* Summary */}
        <Box mb={32}>
          <Text
            ff="Manrope"
            fw={800}
            size="xs"
            tt="uppercase"
            style={{ letterSpacing: 1.2 }}
            c="#0F172A"
            mb="sm"
          >
            Professional Profile
          </Text>
          <Text size="sm" c="#475569" lh={1.6}>
            {personal.summary ||
              '[Summary text will appear here as you type. Use the AI Suggestion tool to generate a professional summary based on your role.]'}
          </Text>
        </Box>

        {/* Skills */}
        {skills.length > 0 && (
          <Box mb={32}>
            <Text
              ff="Manrope"
              fw={800}
              size="xs"
              tt="uppercase"
              style={{ letterSpacing: 1.2 }}
              c="#0F172A"
              mb="sm"
            >
              Core Expertise
            </Text>
            <Group gap="xs">
              {skills.map((skill, idx) => (
                <Box key={idx} bg="#F1F5F9" px={12} py={4} style={{ borderRadius: 999 }}>
                  <Text size="xs" fw={700} c="#0F172A" ff="Manrope">
                    {skill}
                  </Text>
                </Box>
              ))}
            </Group>
          </Box>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <Box mb={32}>
            <Text
              ff="Manrope"
              fw={800}
              size="xs"
              tt="uppercase"
              style={{ letterSpacing: 1.2 }}
              c="#0F172A"
              mb="sm"
            >
              Experience
            </Text>
            <Stack gap="xl">
              {experience.map((exp) => (
                <Box key={exp.id}>
                  <Flex justify="space-between" align="flex-start" mb={4} wrap="wrap" gap="xs">
                    <Text fw={800} size="sm" c="#1E293B" ff="Manrope">
                      {exp.title || 'Job Title'}
                    </Text>
                    <Text fw={700} size="xs" c="#64748B" ff="Manrope" style={{ whiteSpace: 'nowrap' }}>
                      {exp.startDate || 'Start'} -{' '}
                      {exp.current ? 'Present' : exp.endDate || 'End'}
                    </Text>
                  </Flex>
                  <Text fw={700} size="xs" c="#64748B" ff="Manrope" mb="sm">
                    {exp.company || 'Company Name'}
                  </Text>
                  <Text size="sm" c="#475569" lh={1.6} style={{ whiteSpace: 'pre-line' }}>
                    {exp.description || 'Description of responsibilities and achievements.'}
                  </Text>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* Education */}
        {education.length > 0 && (
          <Box mb={32}>
            <Text
              ff="Manrope"
              fw={800}
              size="xs"
              tt="uppercase"
              style={{ letterSpacing: 1.2 }}
              c="#0F172A"
              mb="sm"
            >
              Education
            </Text>
            <Stack gap="md">
              {education.map((edu) => (
                <Box key={edu.id}>
                  <Text fw={800} size="sm" c="#1E293B" ff="Manrope" mb={4}>
                    {edu.degree || 'Degree'}
                  </Text>
                  <Text fw={600} size="xs" c="#64748B" ff="Manrope">
                    {edu.school || 'School Name'} | {edu.year || 'Year'}
                  </Text>
                  {edu.description && (
                    <Text size="sm" c="#475569" mt={8}>
                      {edu.description}
                    </Text>
                  )}
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
}
