import { langFromName } from '../store/useStore';

export interface RunResult {
  output: string[];
  errors: string[];
  duration: number;
}

export function runScript(code: string, fileName: string): RunResult {
  const lang = langFromName(fileName);
  const start = performance.now();

  if (lang === 'javascript') {
    return runJavaScript(code, start);
  }

  return simulateExecution(code, lang, start);
}

function runJavaScript(code: string, start: number): RunResult {
  const output: string[] = [];
  const errors: string[] = [];

  const mockConsole = {
    log: (...args: unknown[]) => output.push(args.map(String).join(' ')),
    error: (...args: unknown[]) => errors.push(args.map(String).join(' ')),
    warn: (...args: unknown[]) => output.push('[WARN] ' + args.map(String).join(' ')),
    info: (...args: unknown[]) => output.push('[INFO] ' + args.map(String).join(' ')),
    table: (data: unknown) => output.push(JSON.stringify(data, null, 2)),
  };

  try {
    const fn = new Function('console', code);
    fn(mockConsole);
  } catch (e: unknown) {
    errors.push(e instanceof Error ? e.message : String(e));
  }

  return { output, errors, duration: performance.now() - start };
}

function simulateExecution(code: string, lang: string, start: number): RunResult {
  const output: string[] = [];
  const errors: string[] = [];

  output.push(`[Simulating ${lang} execution...]`);

  const lines = code.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();

    if (lang === 'python') {
      const printMatch = trimmed.match(/^print\s*\(\s*(?:f?"([^"]*?)"|'([^']*?)')\s*\)/);
      if (printMatch) output.push(printMatch[1] ?? printMatch[2] ?? '');
    }

    if (lang === 'shell') {
      const echoMatch = trimmed.match(/^echo\s+"?(.+?)"?\s*$/);
      if (echoMatch) output.push(echoMatch[1]);
    }

    if (lang === 'powershell') {
      const whMatch = trimmed.match(/^Write-Host\s+"?(.+?)"?(\s+-\w+\s+\w+)*\s*$/);
      if (whMatch) output.push(whMatch[1]);
    }
  }

  if (output.length === 1) {
    output.push('(no output captured — mock engine only parses simple print/echo statements)');
  }

  return { output, errors, duration: performance.now() - start };
}
