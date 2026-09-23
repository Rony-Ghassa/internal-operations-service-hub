export const ALLOWED_REQUEST_TYPES = [
  'Password Reset',
  'Leave Request',
  'Reimbursement',
] as const;

export type AllowedRequestType =
  (typeof ALLOWED_REQUEST_TYPES)[number];

export function isAllowedRequestType(
  value: string,
): value is AllowedRequestType {
  return ALLOWED_REQUEST_TYPES.includes(
    value as AllowedRequestType,
  );
}