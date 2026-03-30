import type { Macro } from '../types';

export function exportMacroAsPython(macro: Macro): string {
  const lines: string[] = [
    '# Auto-generated macro script by ScriptForge',
    `# Macro: ${macro.name}`,
    'import time',
    'import webbrowser',
    'import subprocess',
    '',
    `def macro_${macro.name.replace(/\s+/g, '_').toLowerCase()}():`,
    `    """${macro.name}"""`,
  ];

  for (const action of macro.actions) {
    switch (action.type) {
      case 'click':
        lines.push(`    # Click at (${action.params.x}, ${action.params.y})`);
        lines.push(`    print(f"Clicking at ({${action.params.x}}, {${action.params.y}}) with ${action.params.button} button")`);
        break;
      case 'type':
        lines.push(`    # Type text`);
        lines.push(`    print("Typing: ${action.params.text}")`);
        break;
      case 'wait':
        lines.push(`    time.sleep(${Number(action.params.duration) / 1000})`);
        break;
      case 'openUrl':
        lines.push(`    webbrowser.open("${action.params.url}")`);
        break;
      case 'runScript':
        lines.push(`    subprocess.run(["python", "${action.params.path}"])`);
        break;
      case 'ifElse':
        lines.push(`    if ${action.params.condition || 'True'}:`);
        lines.push(`        ${action.params.thenAction || 'pass'}`);
        lines.push(`    else:`);
        lines.push(`        ${action.params.elseAction || 'pass'}`);
        break;
      case 'loop':
        lines.push(`    for _i in range(${action.params.count}):`);
        lines.push(`        print(f"Loop iteration {_i + 1}")`);
        break;
      case 'keystroke': {
        const mods: string[] = [];
        if (action.params.ctrl === 'true') mods.push('ctrl');
        if (action.params.alt === 'true') mods.push('alt');
        if (action.params.shift === 'true') mods.push('shift');
        const combo = [...mods, action.params.key].join('+');
        lines.push(`    # Keystroke: ${combo}`);
        lines.push(`    print("Sending keystroke: ${combo}")`);
        break;
      }
    }
  }

  lines.push('');
  lines.push('if __name__ == "__main__":');
  lines.push(`    macro_${macro.name.replace(/\s+/g, '_').toLowerCase()}()`);
  lines.push('');

  return lines.join('\n');
}

export function exportMacroAsJS(macro: Macro): string {
  const lines: string[] = [
    '// Auto-generated macro script by ScriptForge',
    `// Macro: ${macro.name}`,
    '',
    `async function macro_${macro.name.replace(/\s+/g, '_').toLowerCase()}() {`,
  ];

  for (const action of macro.actions) {
    switch (action.type) {
      case 'click':
        lines.push(`  // Click at (${action.params.x}, ${action.params.y})`);
        lines.push(`  console.log("Clicking at (${action.params.x}, ${action.params.y}) with ${action.params.button} button");`);
        break;
      case 'type':
        lines.push(`  console.log("Typing: ${action.params.text}");`);
        break;
      case 'wait':
        lines.push(`  await new Promise(r => setTimeout(r, ${action.params.duration}));`);
        break;
      case 'openUrl':
        lines.push(`  // window.open("${action.params.url}");`);
        lines.push(`  console.log("Opening URL: ${action.params.url}");`);
        break;
      case 'runScript':
        lines.push(`  console.log("Running script: ${action.params.path}");`);
        break;
      case 'ifElse':
        lines.push(`  if (${action.params.condition || 'true'}) {`);
        lines.push(`    ${action.params.thenAction || '// then'}`);
        lines.push(`  } else {`);
        lines.push(`    ${action.params.elseAction || '// else'}`);
        lines.push(`  }`);
        break;
      case 'loop':
        lines.push(`  for (let i = 0; i < ${action.params.count}; i++) {`);
        lines.push(`    console.log(\`Loop iteration \${i + 1}\`);`);
        lines.push(`  }`);
        break;
      case 'keystroke': {
        const mods: string[] = [];
        if (action.params.ctrl === 'true') mods.push('Ctrl');
        if (action.params.alt === 'true') mods.push('Alt');
        if (action.params.shift === 'true') mods.push('Shift');
        const combo = [...mods, action.params.key].join('+');
        lines.push(`  console.log("Sending keystroke: ${combo}");`);
        break;
      }
    }
  }

  lines.push('}');
  lines.push('');
  lines.push(`macro_${macro.name.replace(/\s+/g, '_').toLowerCase()}();`);
  lines.push('');

  return lines.join('\n');
}
