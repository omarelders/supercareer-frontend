import { useState } from 'react';
import {
  Box,
  Stack,
  Group,
  Text,
  Paper,
  Button,
  RingProgress,
  Badge,
  Center,
} from '@mantine/core';
import { CheckCircle2, Download, Save, Zap, HelpCircle } from 'lucide-react';
import type { CVData } from '../types';
import { generatePDFFromCV } from '../utils/pdfGenerator';

interface ATSScoreProps {
  data: CVData;
}

export function ATSScore({ data }: ATSScoreProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      await generatePDFFromCV(data);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Stack gap="xl">
      {/* Header */}
      <Box mb="md">
        <Text
          ff="Public Sans"
          fw={800}
          size="xl"
          style={{
            fontSize: 'clamp(24px, 5vw, 36px)',
            letterSpacing: '-0.5px',
          }}
          c="#0F172A"
          mb="sm"
        >
          Ready to Launch?
        </Text>
        <Text
          size="lg"
          c="#475569"
          ff="Public Sans"
          style={{ fontSize: 'clamp(14px, 3vw, 18px)' }}
        >
          Your CV is optimized and ready for the modern job market. Review the ATS score and
          download your file below.
        </Text>
      </Box>

      {/* Score Card */}
      <Paper
        p={{ base: 16, sm: 24, md: 32 }}
        radius="md"
        withBorder
        shadow="sm"
        style={{ borderColor: '#135BEC' }}
      >
        <Group justify="space-between" mb="xl" wrap="wrap" gap="sm">
          <Text ff="Public Sans" fw={700} size="xl" c="#0F172A">
            ATS Match Score
          </Text>
          <Badge color="green" variant="light" size="lg" radius="xl">
            OPTIMAL
          </Badge>
        </Group>

        <Stack gap="xl" align="center">
          <RingProgress
            size={140}
            thickness={12}
            roundCaps
            sections={[{ value: 94, color: '#135BEC' }]}
            label={
              <Center>
                <Text ff="Public Sans" fw={900} size="xl" style={{ fontSize: 32 }} c="#135BEC">
                  94%
                </Text>
              </Center>
            }
          />

          <Stack gap="sm" style={{ width: '100%' }}>
            <Text ff="Public Sans" size="md" c="#475569" lh={1.6}>
              Your resume ranks in the top 5% for &quot;Senior Full Stack Engineer&quot; roles.
            </Text>
            <Group gap="xs" mt="sm" wrap="wrap">
              <Group gap={-8}>
                <Box
                  w={24}
                  h={24}
                  bg="#E2E8F0"
                  style={{ borderRadius: '50%', border: '2px solid white', zIndex: 3 }}
                />
                <Box
                  w={24}
                  h={24}
                  bg="#CBD5E1"
                  style={{ borderRadius: '50%', border: '2px solid white', zIndex: 2 }}
                />
                <Box
                  w={24}
                  h={24}
                  bg="#94A3B8"
                  style={{ borderRadius: '50%', border: '2px solid white', zIndex: 1 }}
                />
              </Group>
              <Text size="xs" fw={500} c="#94A3B8" ff="Public Sans" ml="xs">
                Trusted by recruiters at Google, Meta &amp; Netflix
              </Text>
            </Group>
          </Stack>
        </Stack>
      </Paper>

      {/* Keywords Found */}
      <Paper
        p={{ base: 16, sm: 24, md: 32 }}
        radius="md"
        withBorder
        shadow="sm"
        style={{ borderColor: '#135BEC' }}
      >
        <Text
          ff="Public Sans"
          fw={700}
          size="sm"
          tt="uppercase"
          style={{ letterSpacing: 0.7 }}
          c="#64748B"
          mb="xl"
        >
          Keywords Found
        </Text>
        <Group gap="sm">
          {data.skills.length > 0
            ? data.skills.map((skill) => (
                <Badge
                  key={skill}
                  size="lg"
                  color="#135BEC"
                  variant="filled"
                  radius="sm"
                  style={{ textTransform: 'none' }}
                  leftSection={<CheckCircle2 size={12} />}
                >
                  {skill}
                </Badge>
              ))
            : ['React.js', 'TypeScript', 'AWS Architecture', 'CI/CD', 'Node.js'].map((skill) => (
                <Badge
                  key={skill}
                  size="lg"
                  color="#135BEC"
                  variant="filled"
                  radius="sm"
                  style={{ textTransform: 'none' }}
                  leftSection={<CheckCircle2 size={12} />}
                >
                  {skill}
                </Badge>
              ))}
          <Badge size="lg" color="gray" variant="light" radius="sm" style={{ textTransform: 'none' }}>
            +12 more
          </Badge>
        </Group>
      </Paper>

      {/* AI Suggestions */}
      <Paper p={{ base: 16, sm: 24, md: 32 }} radius="md" bg="#0F172A" shadow="md">
        <Group gap="sm" mb="xl">
          <Zap size={20} color="#135BEC" />
          <Text ff="Public Sans" fw={700} size="lg" c="white">
            AI Smart Suggestions
          </Text>
        </Group>

        <Stack gap="md" mb="xl">
          <Paper p="md" radius="sm" withBorder style={{ borderColor: '#135BEC' }}>
            <Text ff="Public Sans" fw={600} size="xs" c="#135BEC" mb={4}>
              Impact Boost
            </Text>
            <Text ff="Public Sans" size="sm" c="#CBD5E1">
              Change &quot;Responsible for project management&quot; to &quot;Orchestrated 4
              cross-functional teams to deliver project 20% ahead of schedule.&quot;
            </Text>
          </Paper>
          <Paper p="md" radius="sm" withBorder style={{ borderColor: '#135BEC' }}>
            <Text ff="Public Sans" fw={600} size="xs" c="#135BEC" mb={4}>
              Layout Tip
            </Text>
            <Text ff="Public Sans" size="sm" c="#CBD5E1">
              The current font size for headers is perfect for OCR scanners, but consider slightly
              increasing line spacing in your Bio.
            </Text>
          </Paper>
        </Stack>

        <Button fullWidth variant="outline" color="white" style={{ borderColor: 'white' }}>
          Apply All AI Improvements
        </Button>
      </Paper>

      {/* Info Box */}
      <Paper p={{ base: 'md', sm: 'xl' }} radius="md" bg="#135BEC" c="white">
        <Group align="flex-start" wrap="nowrap" gap="sm">
          <HelpCircle size={24} color="white" style={{ marginTop: 2, flexShrink: 0 }} />
          <Box>
            <Text ff="Public Sans" fw={700} size="sm" mb={4}>
              What is ATS?
            </Text>
            <Text ff="Public Sans" size="xs" style={{ opacity: 0.9 }}>
              Applicant Tracking Systems are used by 99% of Fortune 500 companies to filter
              candidates. Our builder ensures your CV is 100% readable by these systems.
            </Text>
          </Box>
        </Group>
      </Paper>

      {/* Actions - Desktop */}
      <Group grow mt="xl" visibleFrom="sm">
        <Button
          size="xl"
          radius="md"
          color="#135BEC"
          leftSection={<Download size={20} />}
          onClick={handleDownloadPDF}
          loading={isGenerating}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating PDF...' : 'Download PDF'}
        </Button>
        <Button size="xl" radius="md" variant="outline" color="#135BEC" leftSection={<Save size={20} />}>
          Save Draft
        </Button>
      </Group>

      {/* Actions - Mobile */}
      <Stack gap="md" mt="xl" hiddenFrom="sm">
        <Button
          fullWidth
          size="lg"
          radius="md"
          color="#135BEC"
          leftSection={<Download size={20} />}
          onClick={handleDownloadPDF}
          loading={isGenerating}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating PDF...' : 'Download PDF'}
        </Button>
        <Button fullWidth size="lg" radius="md" variant="outline" color="#135BEC" leftSection={<Save size={20} />}>
          Save Draft
        </Button>
      </Stack>
    </Stack>
  );
}
