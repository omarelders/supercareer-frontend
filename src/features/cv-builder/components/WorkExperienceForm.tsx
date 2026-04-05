import {
  Stack,
  Group,
  TextInput,
  Textarea,
  Button,
  Paper,
  Checkbox,
} from '@mantine/core';
import { Plus, Trash2 } from 'lucide-react';
import type { CVData, Experience } from '../types';

interface WorkExperienceFormProps {
  data: CVData['experience'];
  onChange: (data: CVData['experience']) => void;
  onNext: () => void;
  onBack: () => void;
}

export function WorkExperienceForm({ data, onChange, onNext, onBack }: WorkExperienceFormProps) {
  const addExperience = () => {
    onChange([
      ...data,
      {
        id: Date.now().toString(),
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      },
    ]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
    onChange(data.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)));
  };

  const removeExperience = (id: string) => {
    onChange(data.filter((exp) => exp.id !== id));
  };

  return (
    <Stack gap="xl">
      {data.map((exp, index) => (
        <Paper
          key={exp.id}
          p={32}
          radius="md"
          withBorder
          shadow="sm"
          style={{
            borderColor: index === 0 ? '#135BEC' : '#E2E8F0',
          }}
        >
          <Stack gap="md">
            <Checkbox
              label="I currently work here"
              checked={exp.current}
              onChange={(e) => updateExperience(exp.id, 'current', e.currentTarget.checked)}
              color="#135BEC"
              styles={{
                label: { fontWeight: 600, color: '#475569' },
              }}
            />

            <TextInput
              label="Job Title"
              placeholder="Senior UX Designer"
              value={exp.title}
              onChange={(e) => updateExperience(exp.id, 'title', e.currentTarget.value)}
              styles={{ label: { fontWeight: 700, marginBottom: 8 } }}
              size="md"
            />

            <TextInput
              label="Company"
              placeholder="Creative Solutions Inc."
              value={exp.company}
              onChange={(e) => updateExperience(exp.id, 'company', e.currentTarget.value)}
              styles={{ label: { fontWeight: 700, marginBottom: 8 } }}
              size="md"
            />

            <Group grow align="flex-start">
              <TextInput
                label="Start Date"
                placeholder="March 2021"
                value={exp.startDate}
                onChange={(e) => updateExperience(exp.id, 'startDate', e.currentTarget.value)}
                styles={{ label: { fontWeight: 700, marginBottom: 8 } }}
                size="md"
              />
              <TextInput
                label="End Date"
                placeholder={exp.current ? 'Present' : 'February 2023'}
                value={exp.current ? 'Present' : exp.endDate}
                onChange={(e) => updateExperience(exp.id, 'endDate', e.currentTarget.value)}
                disabled={exp.current}
                styles={{ label: { fontWeight: 700, marginBottom: 8 } }}
                size="md"
              />
            </Group>

            <Textarea
              label="Description"
              placeholder="Describe your responsibilities and achievements..."
              value={exp.description}
              onChange={(e) => updateExperience(exp.id, 'description', e.currentTarget.value)}
              styles={{ label: { fontWeight: 700, marginBottom: 8 } }}
              size="md"
              minRows={4}
            />

            <Group justify="flex-end" mt="sm">
              <Button
                variant="subtle"
                color="red"
                leftSection={<Trash2 size={16} />}
                onClick={() => removeExperience(exp.id)}
              >
                Remove Position
              </Button>
            </Group>
          </Stack>
        </Paper>
      ))}

      <Button
        variant="outline"
        color="#135BEC"
        size="lg"
        radius="md"
        style={{ borderStyle: 'dashed', borderWidth: 2 }}
        leftSection={<Plus size={20} />}
        onClick={addExperience}
      >
        Add Another Position
      </Button>

      <Group justify="space-between" mt="xl">
        <Button variant="subtle" color="gray" size="md" onClick={onBack}>
          Back
        </Button>
        <Button color="#136DEC" size="md" radius="xl" onClick={onNext}>
          Next: Education
        </Button>
      </Group>
    </Stack>
  );
}
