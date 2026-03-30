import type { VariableInfo } from '../types';

export function parseVariables(code: string, language: string): VariableInfo[] {
  const vars: VariableInfo[] = [];
  const lines = code.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    switch (language) {
      case 'python':
        parsePython(line, lineNum, vars);
        break;
      case 'javascript':
      case 'typescript':
        parseJavaScript(line, lineNum, vars);
        break;
      case 'shell':
        parseBash(line, lineNum, vars);
        break;
      case 'powershell':
        parsePowerShell(line, lineNum, vars);
        break;
    }
  }

  return vars;
}

function parsePython(line: string, lineNum: number, vars: VariableInfo[]) {
  const trimmed = line.trim();
  if (trimmed.startsWith('#') || trimmed === '') return;

  const defMatch = trimmed.match(/^def\s+(\w+)\s*\(/);
  if (defMatch) {
    vars.push({ name: defMatch[1], kind: 'function', line: lineNum });
    return;
  }

  const classMatch = trimmed.match(/^class\s+(\w+)/);
  if (classMatch) {
    vars.push({ name: classMatch[1], kind: 'class', line: lineNum });
    return;
  }

  const assignMatch = trimmed.match(/^([A-Za-z_]\w*)\s*=\s*(.+)/);
  if (assignMatch && !trimmed.startsWith('if ') && !trimmed.startsWith('elif ')) {
    const name = assignMatch[1];
    const value = assignMatch[2].trim();
    const isConst = name === name.toUpperCase() && name.length > 1;
    vars.push({ name, kind: isConst ? 'constant' : 'variable', line: lineNum, value: truncate(value) });
  }
}

function parseJavaScript(line: string, lineNum: number, vars: VariableInfo[]) {
  const trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed === '') return;

  const funcMatch = trimmed.match(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)/);
  if (funcMatch) {
    vars.push({ name: funcMatch[1], kind: 'function', line: lineNum });
    return;
  }

  const classMatch = trimmed.match(/^(?:export\s+)?class\s+(\w+)/);
  if (classMatch) {
    vars.push({ name: classMatch[1], kind: 'class', line: lineNum });
    return;
  }

  const constMatch = trimmed.match(/^(?:export\s+)?const\s+(\w+)\s*=\s*(.+)/);
  if (constMatch) {
    vars.push({ name: constMatch[1], kind: 'constant', line: lineNum, value: truncate(constMatch[2]) });
    return;
  }

  const letMatch = trimmed.match(/^(?:export\s+)?(?:let|var)\s+(\w+)(?:\s*=\s*(.+))?/);
  if (letMatch) {
    vars.push({ name: letMatch[1], kind: 'variable', line: lineNum, value: letMatch[2] ? truncate(letMatch[2]) : undefined });
  }

  const arrowMatch = trimmed.match(/^(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\(/);
  if (arrowMatch && !constMatch) {
    vars.push({ name: arrowMatch[1], kind: 'function', line: lineNum });
  }
}

function parseBash(line: string, lineNum: number, vars: VariableInfo[]) {
  const trimmed = line.trim();
  if (trimmed.startsWith('#') || trimmed === '') return;

  const funcMatch = trimmed.match(/^(\w+)\s*\(\)\s*\{?/);
  if (funcMatch) {
    vars.push({ name: funcMatch[1], kind: 'function', line: lineNum });
    return;
  }

  const assignMatch = trimmed.match(/^(\w+)=(.+)/);
  if (assignMatch) {
    vars.push({
      name: assignMatch[1],
      kind: assignMatch[1] === assignMatch[1].toUpperCase() ? 'constant' : 'variable',
      line: lineNum,
      value: truncate(assignMatch[2].replace(/^["']|["']$/g, '')),
    });
  }
}

function parsePowerShell(line: string, lineNum: number, vars: VariableInfo[]) {
  const trimmed = line.trim();
  if (trimmed.startsWith('#') || trimmed === '') return;

  const funcMatch = trimmed.match(/^function\s+(\w[\w-]*)/i);
  if (funcMatch) {
    vars.push({ name: funcMatch[1], kind: 'function', line: lineNum });
    return;
  }

  const varMatch = trimmed.match(/^\$(\w+)\s*=\s*(.+)/);
  if (varMatch) {
    vars.push({ name: `$${varMatch[1]}`, kind: 'variable', line: lineNum, value: truncate(varMatch[2]) });
  }
}

function truncate(s: string, max = 40): string {
  const clean = s.replace(/;?\s*$/, '');
  return clean.length > max ? clean.slice(0, max) + '…' : clean;
}
