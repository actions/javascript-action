/**
 * Check if status entered by user is allowed by GitHub Actions.
 * @param {string} status - job status
 * @returns {string}
 */
export function isAllowedStatus(status: string): string {
  const lowercaseStatus: string = status.toLowerCase();
  const jobStatusList: string[] = ['success', 'failure', 'cancelled'];

  if (!jobStatusList.includes(lowercaseStatus)) {
    throw new Error('Invalid value input');
  }
  return status;
}