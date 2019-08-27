export function getStatus(status: string): number {
  const lowercase_type: string = status.toLowerCase();

  if (lowercase_type.includes('success')) {
    return 1;
  } else if (lowercase_type.includes('fail')) {
    return 0;
  } else {
    throw new Error('Allow words that contain "success" or "fail"');
  }
}