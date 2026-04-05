import { MantineProvider } from '@mantine/core'
import { CVBuilder } from './CVBuilder'
import './cv-builder.css'

export default function CVBuilderPage() {
  return (
    <div className="cv-builder-root">
      <MantineProvider
        cssVariablesSelector=".cv-builder-root"
        theme={{
          fontFamily: 'Inter, sans-serif',
          headings: {
            fontFamily: 'Manrope, sans-serif',
          },
          primaryColor: 'blue',
        }}
      >
        <CVBuilder />
      </MantineProvider>
    </div>
  )
}
