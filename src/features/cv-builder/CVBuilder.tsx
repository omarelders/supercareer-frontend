import { useRef, useState, type ChangeEvent } from 'react';
import {
  Alert,
  Box,
  Center,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  AlertCircle,
  FileUp,
  Loader2,
  PlusCircle,
  UserRound,
} from 'lucide-react';
import { ProgressBar } from './components/ProgressBar';
import { CVPreview } from './components/CVPreview';
import { PersonalDetailsForm } from './components/PersonalDetailsForm';
import { WorkExperienceForm } from './components/WorkExperienceForm';
import { EducationForm } from './components/EducationForm';
import { SkillsForm } from './components/SkillsForm';
import { ATSScore } from './components/ATSScore';
import type { CVData } from './types';
import { buildCvFromOldResume, buildCvFromProfile } from '@/services/cvAiApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/authSlice';
import api from '@/services/api';

const EMPTY_CV: CVData = {
  personal: {
    fullName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    url: '',
    summary: '',
  },
  experience: [],
  education: [],
  skills: [],
};

type BuilderStartMode = 'choose' | 'manual';
type BuildSource = 'old-resume' | 'profile' | 'scratch';

interface ProfileResponse {
  id: number;
  user?: number;
}

interface StartOptionCardProps {
  description: string;
  icon: typeof FileUp;
  isLoading?: boolean;
  onClick: () => void;
  title: string;
}

function StartOptionCard({
  description,
  icon: Icon,
  isLoading = false,
  onClick,
  title,
}: StartOptionCardProps) {
  return (
    <Paper
      component="button"
      type="button"
      onClick={onClick}
      disabled={isLoading}
      p={{ base: 20, md: 28 }}
      radius="xl"
      withBorder
      shadow="sm"
      style={{
        cursor: isLoading ? 'wait' : 'pointer',
        textAlign: 'left',
        transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
        borderColor: '#E2E8F0',
      }}
    >
      <Stack gap="lg">
        <ThemeIcon size={64} radius="xl" variant="light" color="blue">
          {isLoading ? <Loader2 size={28} className="animate-spin" /> : <Icon size={28} />}
        </ThemeIcon>
        <Stack gap={6}>
          <Text fw={800} ff="Manrope" c="#0F172A" size="xl">
            {title}
          </Text>
          <Text c="#475569" size="sm">
            {description}
          </Text>
        </Stack>
      </Stack>
    </Paper>
  );
}

export function CVBuilder() {
  const user = useAppSelector(selectUser);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [startMode, setStartMode] = useState<BuilderStartMode>('choose');
  const [selectedSource, setSelectedSource] = useState<BuildSource | null>(null);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [cvData, setCvData] = useState<CVData>(EMPTY_CV);

  const isHydratingCv = selectedSource === 'old-resume' || selectedSource === 'profile';

  const resetIntoBuilder = (data: CVData, source: BuildSource) => {
    setCvData(data);
    setSelectedSource(source);
    setSourceError(null);
    setStep(1);
    setStartMode('manual');
  };

  const getProfileUserId = async (): Promise<number> => {
    if (typeof user?.id === 'number' && Number.isFinite(user.id)) {
      return user.id;
    }

    if (typeof user?.id === 'string') {
      const parsed = Number(user.id);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    const { data } = await api.get<ProfileResponse>('/api/profile/');
    const fallbackId = data.user ?? data.id;
    if (!fallbackId) {
      throw new Error('Could not determine your profile ID.');
    }
    return fallbackId;
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== 'string') {
          reject(new Error('Failed to read the selected file.'));
          return;
        }

        const commaIndex = result.indexOf(',');
        const base64 = commaIndex !== -1 ? result.substring(commaIndex + 1) : result;
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to read the selected file.'));
      reader.readAsDataURL(file);
    });

  const handleBuildFromProfile = async () => {
    setSelectedSource('profile');
    setSourceError(null);

    try {
      const profileUserId = await getProfileUserId();
      const builtCv = await buildCvFromProfile(profileUserId);
      resetIntoBuilder(builtCv, 'profile');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'We could not build a CV from your profile right now.';
      setSelectedSource(null);
      setSourceError(message);
    }
  };

  const handleBuildFromScratch = () => {
    resetIntoBuilder(EMPTY_CV, 'scratch');
  };

  const handleOldResumeClick = () => {
    if (selectedSource) return;
    fileInputRef.current?.click();
  };

  const handleResumeFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    // Front-end size validation (limit to 5MB)
    const MAX_FILE_SIZE_MB = 5;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setSourceError(`The selected file is too large. Please upload a file smaller than ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setSelectedSource('old-resume');
    setSourceError(null);

    try {
      const fileBase64 = await fileToBase64(file);
      const builtCv = await buildCvFromOldResume(fileBase64, file.name);
      resetIntoBuilder(builtCv, 'old-resume');
    } catch (error: any) {
      console.error('[CVBuilder] Failed to build CV from resume:', error);
      if (error?.response?.data) {
        console.error('[CVBuilder] Error response data:', error.response.data);
      }

      let message = 'We could not build a CV from the uploaded resume.';
      if (error?.response?.data?.detail) {
        message = error.response.data.detail;
      } else if (error instanceof Error) {
        message = error.message;
      }

      setSelectedSource(null);
      setSourceError(message);
    }
  };

  const getStepInfo = () => {
    switch (step) {
      case 1:
        return {
          title: 'Personal Details',
          description:
            'This information will be the first thing employers see. Make sure your contact details are accurate.',
          nextLabel: 'Work Experience',
        };
      case 2:
        return {
          title: 'Tell us about your work experience',
          description: 'Start with your most recent role. This helps employers see your career growth.',
          nextLabel: 'Education',
        };
      case 3:
        return {
          title: 'Education History',
          description: 'List your academic qualifications, starting with the most recent.',
          nextLabel: 'Skills',
        };
      case 4:
        return {
          title: 'What are your top skills?',
          description: 'Technical and soft skills help you stand out. AI is suggesting skills based on your role.',
          nextLabel: 'Review',
        };
      default:
        return { title: '', description: '', nextLabel: '' };
    }
  };

  const stepInfo = getStepInfo();

  if (startMode === 'choose') {
    return (
      <Box>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          hidden
          onChange={handleResumeFileSelected}
        />

        <Stack gap="xl">
          <Box>
            <Group justify="space-between" align="flex-start" gap="md">
              <Stack gap={8}>
                <Text size="xs" fw={500} c="#64748B" tt="uppercase" style={{ letterSpacing: 1.2 }}>
                  CV Builder
                </Text>
                <Text
                  size="xl"
                  fw={800}
                  c="#0F172A"
                  ff="Manrope"
                  style={{ fontSize: 'clamp(24px, 4vw, 36px)' }}
                >
                  Create Resume
                </Text>
                <Text size="md" c="#475569" maw={640}>
                  Choose how you want to begin. We can build from an older resume,
                  generate from your profile, or let you start manually.
                </Text>
              </Stack>
              <Text size="sm" c="#64748B" fw={600}>
                Then continue through 4 editing steps
              </Text>
            </Group>
          </Box>

          {sourceError && (
            <Alert
              icon={<AlertCircle size={16} />}
              color="red"
              radius="md"
              variant="light"
              title="Could not start this CV"
            >
              {sourceError}
            </Alert>
          )}

          <Grid gutter={{ base: 16, md: 24 }}>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <StartOptionCard
                title="From Old Resume"
                description="Upload an existing CV and let AI convert it into the builder schema."
                icon={FileUp}
                isLoading={selectedSource === 'old-resume'}
                onClick={handleOldResumeClick}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <StartOptionCard
                title="From Your Profile"
                description="Use your current account profile to generate a draft CV automatically."
                icon={UserRound}
                isLoading={selectedSource === 'profile'}
                onClick={handleBuildFromProfile}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <StartOptionCard
                title="From Scratch"
                description="Open the builder with empty sections and fill everything manually."
                icon={PlusCircle}
                isLoading={selectedSource === 'scratch'}
                onClick={handleBuildFromScratch}
              />
            </Grid.Col>
          </Grid>

          {isHydratingCv && (
            <Center py="md">
              <Group gap="sm">
                <Loader2 size={18} className="animate-spin" />
                <Text size="sm" c="#475569">
                  Preparing your CV draft...
                </Text>
              </Group>
            </Center>
          )}
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Grid
        gutter={{
          base: 16,
          sm: 24,
          md: 40,
        }}
      >
        {/* Left Column: Form Area */}
        <Grid.Col
          span={{
            base: 12,
            lg: step === 5 ? 6 : 7,
          }}
        >
          {step < 5 && (
            <ProgressBar
              step={step}
              totalSteps={4}
              title={stepInfo.title}
              description={stepInfo.description}
              nextStepLabel={stepInfo.nextLabel}
            />
          )}

          {step === 1 && (
            <PersonalDetailsForm
              data={cvData.personal}
              onChange={(personal) => setCvData({ ...cvData, personal })}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <WorkExperienceForm
              data={cvData.experience}
              onChange={(experience) => setCvData({ ...cvData, experience })}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <EducationForm
              data={cvData.education}
              onChange={(education) => setCvData({ ...cvData, education })}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && (
            <SkillsForm
              data={cvData.skills}
              cvData={cvData}
              onChange={(skills) => setCvData({ ...cvData, skills })}
              onNext={() => setStep(5)}
              onBack={() => setStep(3)}
            />
          )}

          {step === 5 && <ATSScore data={cvData} />}
        </Grid.Col>

        {/* Right Column: Live Preview (desktop only) */}
        <Grid.Col
          span={{
            base: 12,
            lg: step === 5 ? 6 : 5,
          }}
          visibleFrom="lg"
        >
          <Box
            style={{
              position: 'sticky',
              top: 40,
              height: 'calc(100vh - 80px)',
            }}
          >
            <CVPreview data={cvData} />
          </Box>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
