export enum Status {
  Failure = 0,
  Success = 1
}

export function getStatus(type: string): Status {
  const lowercase_type: string = type.toLowerCase();

  if (lowercase_type.includes('success')) {
    return Status.Success;
  } else if (lowercase_type.includes('fail')) {
    return Status.Failure;
  } else {
    throw new Error('Allow words that contain "success" or "fail"');
  }
}