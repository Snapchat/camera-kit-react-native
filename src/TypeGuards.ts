type UnknownRecord<T = unknown> = Record<string | number | symbol, T>;

export function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isString(value: unknown): value is string {
    return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
    return typeof value === 'number';
}

export const isValidNumber = (value: unknown): value is number => {
    return isNumber(value) && !Number.isNaN(value) && Number.isFinite(value);
};
