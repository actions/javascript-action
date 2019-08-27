export function getStatus(status: string): number {
  const lowercase_type: string = status.toLowerCase();

  if (lowercase_type.includes('success')) {
    return 2;
  } else if (lowercase_type.includes('fail')) {
    return 1;
  } else {
    throw new Error('Allow words that contain "success" or "fail"');
  }
}