export interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  year: string;
  description: string;
}

export interface CVData {
  personal: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    url: string;
    summary: string;
  };
  experience: Experience[];
  education: Education[];
  skills: string[];
}
