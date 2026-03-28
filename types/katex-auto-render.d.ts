declare module "katex/contrib/auto-render" {
  export interface RenderMathInElementOptions {
    delimiters?: Array<{
      left: string;
      right: string;
      display: boolean;
    }>;
    ignoredTags?: string[];
    ignoredClasses?: string[];
    throwOnError?: boolean;
    strict?: boolean | "warn" | "ignore";
    trust?: boolean | ((context: unknown) => boolean);
    macros?: Record<string, string>;
  }

  export default function renderMathInElement(
    element: HTMLElement,
    options?: RenderMathInElementOptions,
  ): void;
}

