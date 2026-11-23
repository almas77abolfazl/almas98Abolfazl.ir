import * as PrismModule from 'prismjs';

const Prism = (PrismModule as any).default || PrismModule;

const g: any = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : global;
g.Prism = Prism;

export { Prism };
