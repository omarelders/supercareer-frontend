import type { CVData } from '../types';

export const generatePDFFromCV = async (data: CVData): Promise<void> => {
  const html2canvas = (await import('html2canvas')).default;
  const jsPDF = (await import('jspdf')).default;

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '210mm';
  container.style.backgroundColor = 'white';
  container.style.padding = '40px';
  container.style.fontFamily = 'Manrope, sans-serif';

  container.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h1 style="font-family: Manrope; font-weight: 800; font-size: 32px; text-transform: uppercase; letter-spacing: -0.5px; color: #0F172A; margin: 0 0 4px 0;">
            ${data.personal.fullName || 'Alex Rivera'}
          </h1>
          <p style="font-family: Manrope; font-weight: 800; font-size: 14px; color: #135BEC; text-transform: uppercase; letter-spacing: 2px; margin: 0;">
            ${data.personal.title || 'Senior UX Designer'}
          </p>
        </div>
        <div style="text-align: right;">
          <p style="font-size: 12px; font-weight: 600; color: #64748B; margin: 0 0 8px 0;">
            📧 ${data.personal.email || 'alex.rivera@example.com'}
          </p>
          <p style="font-size: 12px; font-weight: 600; color: #64748B; margin: 0 0 8px 0;">
            📱 ${data.personal.phone || '+1 (555) 000-0000'}
          </p>
          <p style="font-size: 12px; font-weight: 600; color: #64748B; margin: 0;">
            📍 ${data.personal.location || 'San Francisco, CA'}
          </p>
        </div>
      </div>

      ${
        data.personal.summary
          ? `
      <div style="margin-bottom: 32px;">
        <h2 style="font-family: Manrope; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 1.2px; color: #0F172A; margin: 0 0 8px 0;">
          Professional Profile
        </h2>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0;">
          ${data.personal.summary}
        </p>
      </div>
      `
          : ''
      }

      ${
        data.skills.length > 0
          ? `
      <div style="margin-bottom: 32px;">
        <h2 style="font-family: Manrope; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 1.2px; color: #0F172A; margin: 0 0 8px 0;">
          Core Expertise
        </h2>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${data.skills
            .map(
              (skill) => `
            <span style="background-color: #F1F5F9; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; color: #0F172A;">
              ${skill}
            </span>
          `,
            )
            .join('')}
        </div>
      </div>
      `
          : ''
      }

      ${
        data.experience.length > 0
          ? `
      <div style="margin-bottom: 32px;">
        <h2 style="font-family: Manrope; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 1.2px; color: #0F172A; margin: 0 0 8px 0;">
          Experience
        </h2>
        ${data.experience
          .map(
            (exp) => `
          <div style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
              <h3 style="font-weight: 800; font-size: 14px; color: #1E293B; margin: 0;">
                ${exp.title || 'Job Title'}
              </h3>
              <span style="font-weight: 700; font-size: 12px; color: #64748B; white-space: nowrap;">
                ${exp.startDate || 'Start'} - ${exp.current ? 'Present' : exp.endDate || 'End'}
              </span>
            </div>
            <p style="font-weight: 700; font-size: 12px; color: #64748B; margin: 0 0 8px 0;">
              ${exp.company || 'Company Name'}
            </p>
            <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0; white-space: pre-line;">
              ${exp.description || 'Description of responsibilities and achievements.'}
            </p>
          </div>
        `,
          )
          .join('')}
      </div>
      `
          : ''
      }

      ${
        data.education.length > 0
          ? `
      <div style="margin-bottom: 32px;">
        <h2 style="font-family: Manrope; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 1.2px; color: #0F172A; margin: 0 0 8px 0;">
          Education
        </h2>
        ${data.education
          .map(
            (edu) => `
          <div style="margin-bottom: 16px;">
            <h3 style="font-weight: 800; font-size: 14px; color: #1E293B; margin: 0 0 4px 0;">
              ${edu.degree || 'Degree'}
            </h3>
            <p style="font-weight: 600; font-size: 12px; color: #64748B; margin: 0;">
              ${edu.school || 'School Name'} | ${edu.year || 'Year'}
            </p>
            ${
              edu.description
                ? `
              <p style="font-size: 14px; color: #475569; margin: 8px 0 0 0;">
                ${edu.description}
              </p>
            `
                : ''
            }
          </div>
        `,
          )
          .join('')}
      </div>
      `
          : ''
      }
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    const fileName = data.personal.fullName
      ? `${data.personal.fullName.replace(/\s+/g, '_')}_CV.pdf`
      : 'My_Professional_CV.pdf';

    pdf.save(fileName);
  } finally {
    document.body.removeChild(container);
  }
};
