import { useState } from 'react';
import { Box, Grid } from '@mantine/core';
import { ProgressBar } from './components/ProgressBar';
import { CVPreview } from './components/CVPreview';
import { PersonalDetailsForm } from './components/PersonalDetailsForm';
import { WorkExperienceForm } from './components/WorkExperienceForm';
import { EducationForm } from './components/EducationForm';
import { SkillsForm } from './components/SkillsForm';
import { ATSScore } from './components/ATSScore';
import type { CVData } from './types';

export function CVBuilder() {
  const [step, setStep] = useState(1);
  const [cvData, setCvData] = useState<CVData>({
    personal: {
      fullName: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      url: '',
      summary: '',
    },
    experience: [
      {
        id: '1',
        title: 'Senior UX Designer',
        company: 'Creative Solutions Inc.',
        startDate: 'March 2021',
        endDate: '',
        current: true,
        description:
          'Led the redesign of the flagship mobile application, resulting in a 25% increase in user engagement. Managed a team of 4 junior designers.',
      },
    ],
    education: [
      {
        id: '1',
        school: 'University of Design & Arts',
        degree: 'B.A. Interaction Design',
        year: '2018',
        description: 'Mention honors, GPA, or relevant coursework...',
      },
    ],
    skills: ['Figma', 'User Research', 'Prototyping', 'HTML/CSS', 'Design Systems'],
  });

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
