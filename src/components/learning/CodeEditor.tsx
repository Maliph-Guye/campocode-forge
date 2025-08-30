import React, { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Play, RotateCcw, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CodeEditorProps {
  exercise: {
    id: string;
    title: string;
    description: string;
    starter_code: string;
    difficulty: 'easy' | 'medium' | 'hard';
    test_cases: any;
  };
  onSubmit?: (code: string) => Promise<boolean>;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ exercise, onSubmit }) => {
  const [code, setCode] = useState(exercise.starter_code || '');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const { theme } = useTheme();

  const handleEditorChange = useCallback((value: string | undefined) => {
    setCode(value || '');
  }, []);

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');
    
    try {
      // Mock code execution - in a real app, this would run on a backend service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock output
      const mockOutput = `Running code...
> ${exercise.title}
> Code executed successfully!
> Output: Hello World!`;
      
      setOutput(mockOutput);
      
      // Mock test results
      const mockTestResults = [
        { name: 'Test 1: Basic functionality', passed: true, expected: 'Hello', actual: 'Hello' },
        { name: 'Test 2: Edge case handling', passed: true, expected: 'World', actual: 'World' },
        { name: 'Test 3: Error handling', passed: false, expected: 'Error', actual: 'Undefined' },
      ];
      
      setTestResults(mockTestResults);
    } catch (error) {
      setOutput('Error: Failed to execute code');
    } finally {
      setIsRunning(false);
    }
  };

  const resetCode = () => {
    setCode(exercise.starter_code || '');
    setOutput('');
    setTestResults([]);
    toast({
      title: "Code Reset",
      description: "Code has been reset to the starter template.",
    });
  };

  const submitSolution = async () => {
    if (onSubmit) {
      const success = await onSubmit(code);
      if (success) {
        toast({
          title: "Solution Submitted!",
          description: "Great job! Your solution is correct.",
        });
      } else {
        toast({
          title: "Solution Incorrect",
          description: "Your solution doesn't pass all tests. Keep trying!",
          variant: "destructive",
        });
      }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const passedTests = testResults.filter(test => test.passed).length;
  const totalTests = testResults.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Problem Description */}
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{exercise.title}</CardTitle>
            <Badge className={getDifficultyColor(exercise.difficulty)}>
              {exercise.difficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p>{exercise.description}</p>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Test Results
                  <Badge variant={passedTests === totalTests ? "default" : "destructive"}>
                    {passedTests}/{totalTests} Passed
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {testResults.map((test, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-3 rounded-lg border ${
                      test.passed
                        ? 'border-green-200 bg-green-50 dark:border-green-800/50 dark:bg-green-900/20'
                        : 'border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-900/20'
                    }`}
                  >
                    {test.passed ? (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{test.name}</p>
                      {!test.passed && (
                        <p className="text-xs text-muted-foreground">
                          Expected: {test.expected}, Got: {test.actual}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Console Output */}
          {output && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Console Output</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                  {output}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Code Editor */}
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Solution</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetCode}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={runCode} disabled={isRunning}>
                {isRunning ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Run Code
              </Button>
              <Button size="sm" onClick={submitSolution}>
                Submit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <div className="h-96 lg:h-full border rounded-lg overflow-hidden">
            <Editor
              height="100%"
              language="javascript"
              value={code}
              onChange={handleEditorChange}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                wordWrap: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                tabSize: 2,
                renderWhitespace: 'boundary',
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};