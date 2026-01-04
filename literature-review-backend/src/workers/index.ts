import { projectWorker } from './project.worker';
import { paperWorker } from './paper.worker';
import { emailWorker } from './email.worker';

export const workers = {
    projectWorker,
    paperWorker,
    emailWorker,
};

console.log('👷 Background workers started');
