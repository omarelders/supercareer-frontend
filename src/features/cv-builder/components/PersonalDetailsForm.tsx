import { Box, Stack, Group, TextInput, Textarea, Button, Text, Paper } from '@mantine/core';
import { User, MapPin, ArrowRight } from 'lucide-react';
import type { CVData } from '../types';

interface PersonalDetailsFormProps {
  data: CVData['personal'];
  onChange: (data: CVData['personal']) => void;
  onNext: () => void;
}

export function PersonalDetailsForm({ data, onChange, onNext }: PersonalDetailsFormProps) {
  const handleChange = (field: keyof CVData['personal'], value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Stack gap="xl">
      <Paper
        p={{
          base: 16,
          sm: 24,
          md: 32,
        }}
        radius="md"
        withBorder
        shadow="sm"
      >
        <Group gap="sm" mb="xl">
          <Box bg="#EFF6FF" p={8} style={{ borderRadius: 8 }}>
            <User size={20} color="#136DEC" />
          </Box>
          <Text ff="Manrope" fw={700} size="xl" c="#0F172A">
            Personal Details
          </Text>
        </Group>

        <Stack gap="md">
          <Group grow align="flex-start" wrap="wrap">
            <TextInput
              label="Full Name"
              placeholder="e.g. Alexander Mitchell"
              value={data.fullName}
              onChange={(e) => handleChange('fullName', e.currentTarget.value)}
              styles={{ label: { fontWeight: 600, marginBottom: 8 } }}
              size="md"
              style={{ minWidth: '200px' }}
            />
            <TextInput
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              value={data.phone}
              onChange={(e) => handleChange('phone', e.currentTarget.value)}
              styles={{ label: { fontWeight: 600, marginBottom: 8 } }}
              size="md"
              style={{ minWidth: '200px' }}
            />
          </Group>

          <TextInput
            label="Professional Title"
            placeholder="e.g. Senior UX/UI Designer"
            value={data.title}
            onChange={(e) => handleChange('title', e.currentTarget.value)}
            styles={{ label: { fontWeight: 600, marginBottom: 8 } }}
            size="md"
          />

          <TextInput
            label="Email Address"
            placeholder="alex.mitchell@design.com"
            value={data.email}
            onChange={(e) => handleChange('email', e.currentTarget.value)}
            styles={{ label: { fontWeight: 600, marginBottom: 8 } }}
            size="md"
          />

          <TextInput
            label="Location"
            placeholder="San Francisco, CA"
            value={data.location}
            onChange={(e) => handleChange('location', e.currentTarget.value)}
            leftSection={<MapPin size={16} color="#94A3B8" />}
            styles={{ label: { fontWeight: 600, marginBottom: 8 } }}
            size="md"
          />

          <TextInput
            label="Portfolio / LinkedIn URL"
            placeholder="https://linkedin.com/in/alexmitchell"
            value={data.url}
            onChange={(e) => handleChange('url', e.currentTarget.value)}
            styles={{ label: { fontWeight: 600, marginBottom: 8 } }}
            size="md"
          />

          <Textarea
            label="Professional Summary"
            placeholder="Brief overview of your career and top skills..."
            value={data.summary}
            onChange={(e) => handleChange('summary', e.currentTarget.value)}
            styles={{ label: { fontWeight: 600, marginBottom: 8 } }}
            size="md"
            minRows={4}
          />
        </Stack>
      </Paper>

      <Group justify="space-between" wrap="wrap" gap="md">
        <Button variant="default" size="md" radius="md">
          Cancel
        </Button>
        <Button
          color="#136DEC"
          size="md"
          radius="md"
          rightSection={<ArrowRight size={16} />}
          onClick={onNext}
        >
          Next: Work Experience
        </Button>
      </Group>
    </Stack>
  );
}
