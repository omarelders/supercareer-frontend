import { useState } from 'react';
import {
  Box,
  Stack,
  Group,
  TextInput,
  Button,
  Text,
  Paper,
  ActionIcon,
  Badge,
} from '@mantine/core';
import { Search, X, Zap, Plus } from 'lucide-react';
import type { CVData } from '../types';

interface SkillsFormProps {
  data: CVData['skills'];
  onChange: (data: CVData['skills']) => void;
  onNext: () => void;
  onBack: () => void;
}

export function SkillsForm({ data, onChange, onNext, onBack }: SkillsFormProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAddSkill = () => {
    if (inputValue.trim() && !data.includes(inputValue.trim())) {
      onChange([...data, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(data.filter((skill) => skill !== skillToRemove));
  };

  const addSuggestedSkill = (skill: string) => {
    if (!data.includes(skill)) {
      onChange([...data, skill]);
    }
  };

  return (
    <Stack gap="xl">
      <Paper p={32} radius="md" withBorder shadow="sm">
        <Group gap="sm" mb="xl">
          <Box bg="#EFF6FF" p={8} style={{ borderRadius: 8 }}>
            <Search size={20} color="#136DEC" />
          </Box>
          <Text ff="Manrope" fw={700} size="xl" c="#1E293B">
            Skill Inventory
          </Text>
        </Group>

        <Stack gap="lg">
          <Group
            align="flex-end"
            style={{ flexWrap: 'nowrap' }}
          >
            <TextInput
              placeholder="Search and add skills (e.g. React, UI Design, AWS)"
              value={inputValue}
              onChange={(e) => setInputValue(e.currentTarget.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
              size="lg"
              style={{ flex: 1 }}
              leftSection={<Search size={18} color="#94A3B8" />}
            />
            <Button size="lg" color="#136DEC" onClick={handleAddSkill}>
              Add
            </Button>
          </Group>

          <Group gap="sm">
            {data.map((skill) => (
              <Badge
                key={skill}
                size="lg"
                color="#136DEC"
                variant="filled"
                radius="xl"
                rightSection={
                  <ActionIcon
                    size="xs"
                    color="blue"
                    radius="xl"
                    variant="transparent"
                    onClick={() => removeSkill(skill)}
                  >
                    <X size={12} color="white" />
                  </ActionIcon>
                }
                style={{ textTransform: 'none', fontWeight: 600 }}
              >
                {skill}
              </Badge>
            ))}
          </Group>
        </Stack>
      </Paper>

      <Paper p={32} radius="md" withBorder shadow="sm">
        <Group justify="space-between" mb="md">
          <Group gap="sm">
            <Zap size={20} color="#10B981" />
            <Text ff="Manrope" fw={700} size="xl" c="#1E293B">
              AI Recommended Keywords
            </Text>
          </Group>
          <Badge
            color="gray"
            variant="light"
            size="lg"
            radius="xl"
            style={{ textTransform: 'none' }}
          >
            Target: Senior Frontend Engineer
          </Badge>
        </Group>

        <Text size="sm" c="#475569" mb="xl">
          Our AI scanned 500+ similar job postings. Adding these keywords will increase your
          visibility to top recruiters:
        </Text>

        <Stack gap="md">
          {[
            'State Management (Redux/Zustand)',
            'Responsive Web Design',
            'Unit Testing (Jest/Cypress)',
            'Performance Optimization',
          ].map((suggestion) => (
            <Paper key={suggestion} p="md" radius="md" withBorder bg="#F8FAFC">
              <Group justify="space-between">
                <Group gap="sm">
                  <Zap size={18} color="#10B981" />
                  <Text fw={700} size="sm" c="#334155" ff="Manrope">
                    {suggestion}
                  </Text>
                </Group>
                <Button
                  variant="subtle"
                  color="#10B981"
                  size="xs"
                  leftSection={<Plus size={14} />}
                  onClick={() => addSuggestedSkill(suggestion)}
                  disabled={data.includes(suggestion)}
                >
                  Add Skill
                </Button>
              </Group>
            </Paper>
          ))}
        </Stack>
      </Paper>

      <Group justify="space-between" mt="xl">
        <Button variant="subtle" color="gray" size="md" onClick={onBack}>
          Back
        </Button>
        <Button color="#136DEC" size="md" radius="xl" onClick={onNext}>
          Continue
        </Button>
      </Group>
    </Stack>
  );
}
