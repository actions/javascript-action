export function getStatus(type: string): number {
  const lowercase_type: string = type.toLowerCase();

  if (lowercase_type.includes('success')) {
    return 0;
  } else if (lowercase_type.includes('fail')) {
    return 1;
  } else {
    throw new Error('Allow words that contain "success" or "fail"');
  }
}