import { RequestClassifier } from './request-classifier';

export class FakeRequestClassifier implements RequestClassifier {
  async classify(
    text: string,
    allowedRequestTypes: readonly string[],
  ): Promise<string> {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('password')) {
      return 'Password Reset';
    }

    if (lowerText.includes('leave')) {
      return 'Leave Request';
    }

    if (
      lowerText.includes('reimbursement') ||
      lowerText.includes('refund')
    ) {
      return 'Reimbursement';
    }

    return 'Unknown';
  }
}