import * as data from './content';
import { useLang } from './i18n';
import { nl } from './translations';
function translate(value: unknown): unknown {
  if (typeof value === 'string') return nl[value] || value;
  if (Array.isArray(value)) return value.map(translate);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, translate(item)]));
  return value;
}
const translated = translate(data) as typeof data;
export function useContent() { return useLang().lang === 'nl' ? translated : data; }
