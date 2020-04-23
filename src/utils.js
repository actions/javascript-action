const jobStatuses = ['success', 'failure', 'cancelled'];
const mentionConditions = [...jobStatuses, 'always'];

function isValid(target, validList) {
  return validList.includes(target);
}

/**
 * Check if status entered by user is allowed by GitHub Actions.
 * @param {string} jobStatus
 * @returns {string|Error}
 */
export function validateStatus(jobStatus) {
  if (!isValid(jobStatus, jobStatuses)) {
    throw new Error('Invalid type parameter');
  }
  return jobStatus;
}

export function isValidCondition(condition) {
  return isValid(condition, mentionConditions);
}
