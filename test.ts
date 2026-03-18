import { getProposals } from './src/services/freelanceApi'
import { getCustomCVs } from './src/services/jobsApi'
import { getJobMatches } from './src/services/jobsApi'

async function run() {
  console.log('Proposals:', (await getProposals()).length)
  console.log('CVs:', (await getCustomCVs()).length)
  console.log('Jobs:', (await getJobMatches()).items.length)
}
run()
