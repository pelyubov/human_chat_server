import { Fn } from './types';

export const isBigNumber = (num: string) => !Number.isSafeInteger(+num);

export const enquoteBigNumber = (jsonString: string, bigNumChecker: Fn<[string], boolean>) =>
  jsonString.replaceAll(/([:\s\[,]*)(\d+)([\s,\]]*)/g, (matchingSubstr, prefix, bigNum, suffix) =>
    bigNumChecker(bigNum) ? `${prefix}"${bigNum}"${suffix}` : matchingSubstr
  );

// parser that turns matching *big numbers* in
// source JSON string to bigint

export const parseWithBigInt = (jsonString: string, bigNumChecker: Fn<[string], boolean>) =>
  JSON.parse(enquoteBigNumber(jsonString, bigNumChecker), (key, value) =>
    !isNaN(value) && bigNumChecker(value) ? BigInt(value) : value
  );

export const JsonParseWithBigInt = (jsonString: string) => parseWithBigInt(jsonString, isBigNumber);
