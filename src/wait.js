/**
 * Waits for a number of milliseconds.
 *
 * @param {number} milliseconds The number of milliseconds to wait.
 * @returns {Promise<string>} Resolves with 'done!' after the wait is over.
 */
export async function wait(milliseconds) {
  return new Promise((resolve) => {
    if (isNaN(milliseconds)) throw new Error('milliseconds is not a number')

    setTimeout(() => resolve('done!'), milliseconds)
  })
}
