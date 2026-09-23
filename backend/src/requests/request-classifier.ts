export const REQUEST_CLASSIFIER = 'REQUEST_CLASSIFIER';

export interface RequestClassifier {
  classify(
    text: string,
    allowedRequestTypes: readonly string[],
  ): Promise<string>;
}