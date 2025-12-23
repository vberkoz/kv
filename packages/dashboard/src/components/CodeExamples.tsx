import { useState } from 'react';
import { API_URL } from '../constants/config';
import { Button } from './ui/Button';

interface CodeExamplesProps {
  namespace: string;
  apiKey: string;
  operation: 'GET' | 'PUT' | 'DELETE' | 'LIST';
  keyName?: string;
}

const generateCode = (op: string, ns: string, key: string, apiKey: string, lang: string) => {
  const url = `${API_URL}/v1/${ns}/${key}`;
  const listUrl = `${API_URL}/v1/${ns}/keys`;
  
  if (lang === 'curl') {
    if (op === 'GET') return `curl "${url}" \\\\\n  -H "Authorization: Bearer ${apiKey}"`;
    if (op === 'PUT') return `curl -X PUT "${url}" \\\\\n  -H "Authorization: Bearer ${apiKey}" \\\\\n  -H "Content-Type: application/json" \\\\\n  -d '{"value": {"name": "John"}}'`;
    if (op === 'DELETE') return `curl -X DELETE "${url}" \\\\\n  -H "Authorization: Bearer ${apiKey}"`;
    if (op === 'LIST') return `curl "${listUrl}" \\\\\n  -H "Authorization: Bearer ${apiKey}"`;
  }
  
  if (lang === 'javascript') {
    if (op === 'GET') return `const res = await fetch('${url}', {\n  headers: { 'Authorization': 'Bearer ${apiKey}' }\n});\nconst data = await res.json();`;
    if (op === 'PUT') return `const res = await fetch('${url}', {\n  method: 'PUT',\n  headers: {\n    'Authorization': 'Bearer ${apiKey}',\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify({ value: { name: 'John' } })\n});`;
    if (op === 'DELETE') return `const res = await fetch('${url}', {\n  method: 'DELETE',\n  headers: { 'Authorization': 'Bearer ${apiKey}' }\n});`;
    if (op === 'LIST') return `const res = await fetch('${listUrl}', {\n  headers: { 'Authorization': 'Bearer ${apiKey}' }\n});\nconst data = await res.json();`;
  }
  
  return '';
};

export default function CodeExamples({ namespace, apiKey, operation, keyName = 'user:123' }: CodeExamplesProps) {
  const [lang, setLang] = useState<'curl' | 'javascript'>('curl');
  const code = generateCode(operation, namespace, keyName, apiKey, lang);

  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">Code Example</h3>
      <div className="flex gap-2 mb-2">
        {(['curl', 'javascript'] as const).map(l => (
          <Button
            key={l}
            size="sm"
            variant={lang === l ? 'default' : 'outline'}
            onClick={() => setLang(l)}
          >
            {l === 'curl' ? 'cURL' : 'JavaScript'}
          </Button>
        ))}
      </div>
      <pre className="bg-gray-900 text-white p-3 rounded overflow-x-auto text-xs">
        <code>{code}</code>
      </pre>
    </div>
  );
}
