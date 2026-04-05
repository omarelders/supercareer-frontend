import {
  Box,
  Stack,
  Group,
  TextInput,
  Textarea,
  Button,
  Text,
  Paper,
} from '@mantine/core';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import type { CVData, Education } from '../types';

interface EducationFormProps {
  data: CVData['education'];
  onChange: (data: CVData['education']) => void;
  onNext: () => void;
  onBack: () => void;
}

export function EducationForm({ data, onChange, onNext, onBack }: EducationFormProps) {
  const addEducation = () => {
    onChange([
      ...data,
      {
        id: Date.now().toString(),
        school: '',
        degree: '',
        year: '',
        description: '',
      },
    ]);
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    onChange(data.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)));
  };

  const removeEducation = (id: string) => {
    onChange(data.filter((edu) => edu.id !== id));
  };

  return (
    <Stack gap="xl">
      {data.map((edu, index) => (
        <Paper
          key={edu.id}
          p={32}
          radius="md"
          withBorder
          shadow="sm"
          style={{
            borderColor: index === 0 ? '#135BEC' : '#E2E8F0',
          }}
        >
          <Stack gap="md">
            <Group gap="sm" mb="sm">
              <Box bg="#EFF6FF" p={8} style={{ borderRadius: 8 }}>
                <GraduationCap size={20} color="#136DEC" />
              </Box>
              <Text ff="Manrope" fw={700} size="lg" c="#0F172A">
                Education {index + 1}
              </Text>
            </Group>

            <TextInput
              label="School / University"
              placeholder="University of Design & Arts"
              value={edu.school}
              onChange={(e) => updateEducation(edu.id, 'school', e.currentTarget.value)}
              styles={{ label: { fontWeight: 700, marginBottom: 8 } }}
              size="md"
            />

            <TextInput
              label="Degree / Qualification"
              placeholder="B.A. Interaction Design"
              value={edu.degree}
              onChange={(e) => updateEducation(edu.id, 'degree', e.currentTarget.value)}
              styles={{ label: { fontWeight: 700, marginBottom: 8 } }}
              size="md"
            />

            <TextInput
              label="Year of Graduation"
              placeholder="2018"
              value={edu.year}
              onChange={(e) => updateEducation(edu.id, 'year', e.currentTarget.value)}
              styles={{ label: { fontWeight: 700, marginBottom: 8 } }}
              size="md"
            />

            <Textarea
              label="Additional Details"
              placeholder="Mention honors, GPA, or relevant coursework..."
              value={edu.description}
              onChange={(e) => updateEducation(edu.id, 'description', e.currentTarget.value)}
              styles={{ label: { fontWeight: 700, marginBottom: 8 } }}
              size="md"
              minRows={3}
            />

            <Group justify="flex-end" mt="sm">
              <Button
                variant="subtle"
                color="red"
                leftSection={<Trash2 size={16} />}
                onClick={() => removeEducation(edu.id)}
              >
                Remove
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
        onClick={addEducation}
      >
        Add Another Education
      </Button>

      <Group justify="space-between" mt="xl">
        <Button variant="subtle" color="gray" size="md" onClick={onBack}>
          Back
        </Button>
        <Button color="#136DEC" size="md" radius="xl" onClick={onNext}>
          Next: Skills
        </Button>
      </Group>
    </Stack>
  );
}
