const jobStatuses: string[] = ['success', 'failure', 'cancelled'];
const metionConditions: string[] = [...jobStatuses, 'always'];

function isValid(target: string, validList: string[]): boolean {
  return validList.includes(target);
}

/**
 * Check if status entered by user is allowed by GitHub Actions.
 * @param {string} jobStatus
 * @returns {string|Error}
 */
export function validateStatus(jobStatus: string): string {
  if (!isValid(jobStatus, jobStatuses)) {
    throw new Error('Invalid type parameter');
  }
  return jobStatus;
}

export function isValidCondition(condition: string): boolean {
  return isValid(condition, metionConditions);
}
