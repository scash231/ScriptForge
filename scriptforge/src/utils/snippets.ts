export interface Snippet {
  id: string;
  label: string;
  language: string;
  category: string;
  code: string;
}

export const snippets: Snippet[] = [
  /* ── Python ── */
  {
    id: 'py-for', label: 'For Loop', language: 'python', category: 'Loops',
    code: `for i in range(10):\n    print(i)\n`,
  },
  {
    id: 'py-while', label: 'While Loop', language: 'python', category: 'Loops',
    code: `count = 0\nwhile count < 10:\n    print(count)\n    count += 1\n`,
  },
  {
    id: 'py-fileio', label: 'File Read/Write', language: 'python', category: 'File I/O',
    code: `with open("data.txt", "w") as f:\n    f.write("Hello, World!")\n\nwith open("data.txt", "r") as f:\n    content = f.read()\n    print(content)\n`,
  },
  {
    id: 'py-http', label: 'HTTP Request', language: 'python', category: 'HTTP',
    code: `import requests\n\nresponse = requests.get("https://api.example.com/data")\nif response.status_code == 200:\n    data = response.json()\n    print(data)\n`,
  },
  {
    id: 'py-tryexcept', label: 'Try / Except', language: 'python', category: 'Error Handling',
    code: `try:\n    result = 10 / 0\nexcept ZeroDivisionError as e:\n    print(f"Error: {e}")\nfinally:\n    print("Done")\n`,
  },
  {
    id: 'py-class', label: 'Class Definition', language: 'python', category: 'OOP',
    code: `class Animal:\n    def __init__(self, name: str, sound: str):\n        self.name = name\n        self.sound = sound\n\n    def speak(self) -> str:\n        return f"{self.name} says {self.sound}!"\n\ndog = Animal("Dog", "Woof")\nprint(dog.speak())\n`,
  },

  /* ── JavaScript ── */
  {
    id: 'js-for', label: 'For Loop', language: 'javascript', category: 'Loops',
    code: `for (let i = 0; i < 10; i++) {\n  console.log(i);\n}\n`,
  },
  {
    id: 'js-foreach', label: 'Array forEach', language: 'javascript', category: 'Loops',
    code: `const items = ["apple", "banana", "cherry"];\nitems.forEach((item, index) => {\n  console.log(\`\${index}: \${item}\`);\n});\n`,
  },
  {
    id: 'js-fetch', label: 'Fetch API', language: 'javascript', category: 'HTTP',
    code: `async function fetchData(url) {\n  try {\n    const response = await fetch(url);\n    const data = await response.json();\n    console.log(data);\n    return data;\n  } catch (error) {\n    console.error("Fetch failed:", error);\n  }\n}\n\nfetchData("https://api.example.com/data");\n`,
  },
  {
    id: 'js-fileio', label: 'File Read (Node)', language: 'javascript', category: 'File I/O',
    code: `const fs = require("fs");\n\n// Write\nfs.writeFileSync("output.txt", "Hello, World!");\n\n// Read\nconst content = fs.readFileSync("output.txt", "utf-8");\nconsole.log(content);\n`,
  },
  {
    id: 'js-promise', label: 'Promise', language: 'javascript', category: 'Async',
    code: `function delay(ms) {\n  return new Promise(resolve => setTimeout(resolve, ms));\n}\n\nasync function main() {\n  console.log("Starting...");\n  await delay(1000);\n  console.log("Done after 1 second");\n}\n\nmain();\n`,
  },
  {
    id: 'js-class', label: 'Class Definition', language: 'javascript', category: 'OOP',
    code: `class Calculator {\n  constructor() {\n    this.result = 0;\n  }\n\n  add(n) { this.result += n; return this; }\n  subtract(n) { this.result -= n; return this; }\n  multiply(n) { this.result *= n; return this; }\n\n  getResult() { return this.result; }\n}\n\nconst calc = new Calculator();\nconsole.log(calc.add(10).subtract(3).multiply(2).getResult());\n`,
  },

  /* ── Bash ── */
  {
    id: 'sh-for', label: 'For Loop', language: 'shell', category: 'Loops',
    code: `for i in {1..10}; do\n  echo "Item $i"\ndone\n`,
  },
  {
    id: 'sh-if', label: 'If Statement', language: 'shell', category: 'Control Flow',
    code: `if [ -f "myfile.txt" ]; then\n  echo "File exists"\nelse\n  echo "File not found"\nfi\n`,
  },
  {
    id: 'sh-func', label: 'Function', language: 'shell', category: 'Functions',
    code: `greet() {\n  local name="$1"\n  echo "Hello, $name!"\n}\n\ngreet "World"\n`,
  },

  /* ── PowerShell ── */
  {
    id: 'ps-for', label: 'ForEach Loop', language: 'powershell', category: 'Loops',
    code: `$items = @("Alpha", "Beta", "Gamma")\nforeach ($item in $items) {\n    Write-Host "Processing: $item"\n}\n`,
  },
  {
    id: 'ps-http', label: 'HTTP Request', language: 'powershell', category: 'HTTP',
    code: `$response = Invoke-RestMethod -Uri "https://api.example.com/data" -Method Get\n$response | ConvertTo-Json | Write-Host\n`,
  },
  {
    id: 'ps-fileio', label: 'File I/O', language: 'powershell', category: 'File I/O',
    code: `# Write\nSet-Content -Path "output.txt" -Value "Hello from PowerShell"\n\n# Read\n$content = Get-Content -Path "output.txt"\nWrite-Host $content\n`,
  },
];

export const snippetCategories = [...new Set(snippets.map((s) => s.category))];
