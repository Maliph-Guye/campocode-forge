import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CodeEditor } from '@/components/learning/CodeEditor';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Code, 
  Play, 
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Learning() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);

  // Mock data - in a real app, this would come from your API
  const course = {
    id: courseId,
    title: 'JavaScript Fundamentals',
    description: 'Learn the core concepts of JavaScript programming',
    progress: 75,
    modules: [
      {
        id: '1',
        title: 'Introduction to JavaScript',
        lessons: [
          {
            id: '1',
            title: 'What is JavaScript?',
            type: 'theory' as const,
            content: `
# What is JavaScript?

JavaScript is a versatile, high-level programming language that is one of the core technologies of the World Wide Web. It enables interactive web pages and is an essential part of web applications.

## Key Features:
- **Dynamic typing**: Variables can hold different types of values
- **Interpreted language**: No compilation needed
- **First-class functions**: Functions are treated as values
- **Prototype-based OOP**: Object-oriented programming through prototypes
- **Event-driven programming**: Responds to user actions

## Where is JavaScript used?
- Web browsers (client-side)
- Web servers (Node.js)
- Mobile applications (React Native, Ionic)
- Desktop applications (Electron)
- IoT devices

JavaScript has evolved from a simple scripting language to a powerful tool for full-stack development.
            `,
            duration: 15,
            completed: true,
          },
          {
            id: '2',
            title: 'Variables and Data Types',
            type: 'theory' as const,
            content: `
# Variables and Data Types

In JavaScript, variables are containers for storing data values. You can declare variables using \`var\`, \`let\`, or \`const\`.

## Variable Declaration:
\`\`\`javascript
let name = "John";
const age = 30;
var city = "New York";
\`\`\`

## Data Types:
1. **Primitive Types:**
   - Number: \`42\`, \`3.14\`
   - String: \`"Hello World"\`
   - Boolean: \`true\`, \`false\`
   - Undefined: \`undefined\`
   - Null: \`null\`
   - Symbol: \`Symbol("id")\`
   - BigInt: \`123n\`

2. **Non-Primitive Types:**
   - Object: \`{name: "John", age: 30}\`
   - Array: \`[1, 2, 3, 4, 5]\`
   - Function: \`function() { return "Hello"; }\`

## Best Practices:
- Use \`const\` for values that won't change
- Use \`let\` for variables that will change
- Avoid \`var\` in modern JavaScript
            `,
            duration: 20,
            completed: true,
          },
          {
            id: '3',
            title: 'First JavaScript Exercise',
            type: 'exercise' as const,
            duration: 30,
            completed: false,
            exercise: {
              id: 'ex1',
              title: 'Variable Declaration Exercise',
              description: `
Create variables to store information about a person:

1. Create a constant called \`firstName\` and assign it the value "John"
2. Create a variable called \`age\` and assign it the value 25
3. Create a variable called \`isStudent\` and assign it the value true
4. Create an object called \`person\` that contains all the above information
5. Console.log the person object

Your output should show the person object with all properties.
              `,
              starter_code: `// Create your variables here

// Create the person object

// Log the result
console.log(person);`,
              difficulty: 'easy' as const,
              test_cases: {}
            }
          }
        ]
      },
      {
        id: '2',
        title: 'Functions and Control Flow',
        lessons: [
          {
            id: '4',
            title: 'Functions in JavaScript',
            type: 'theory' as const,
            content: `
# Functions in JavaScript

Functions are reusable blocks of code that perform specific tasks. They are one of the fundamental building blocks in JavaScript.

## Function Declaration:
\`\`\`javascript
function greet(name) {
    return "Hello, " + name + "!";
}
\`\`\`

## Function Expression:
\`\`\`javascript
const greet = function(name) {
    return "Hello, " + name + "!";
};
\`\`\`

## Arrow Functions:
\`\`\`javascript
const greet = (name) => {
    return "Hello, " + name + "!";
};

// Shorter syntax for single expressions
const greet = name => "Hello, " + name + "!";
\`\`\`

Functions help organize code, promote reusability, and make programs more modular and maintainable.
            `,
            duration: 25,
            completed: false,
          }
        ]
      }
    ]
  };

  const currentModule = course.modules[currentModuleIndex];
  const currentLesson = currentModule?.lessons[currentLessonIndex];
  const totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0);
  const completedLessons = course.modules.reduce((total, module) => 
    total + module.lessons.filter(lesson => lesson.completed).length, 0
  );

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    } else if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
      setCurrentLessonIndex(course.modules[currentModuleIndex - 1].lessons.length - 1);
    }
  };

  const goToNextLesson = () => {
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else if (currentModuleIndex < course.modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentLessonIndex(0);
    }
  };

  const markLessonComplete = () => {
    toast({
      title: "Lesson Completed!",
      description: "Great job! Moving to the next lesson.",
    });
    // In a real app, you'd update the lesson completion status via API
    goToNextLesson();
  };

  const handleExerciseSubmit = async (code: string) => {
    // Mock submission logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    const isCorrect = code.includes('firstName') && code.includes('person') && code.includes('console.log');
    
    if (isCorrect) {
      markLessonComplete();
      return true;
    }
    return false;
  };

  const hasNextLesson = () => {
    return currentLessonIndex < currentModule.lessons.length - 1 || 
           currentModuleIndex < course.modules.length - 1;
  };

  const hasPreviousLesson = () => {
    return currentLessonIndex > 0 || currentModuleIndex > 0;
  };

  if (!currentLesson) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Lesson not found</h2>
          <Button onClick={() => navigate('/courses')}>
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button variant="ghost" onClick={() => navigate('/courses')} className="p-0 h-auto">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Courses
          </Button>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">{currentModule.title}</p>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-muted-foreground mb-1">
            Course Progress
          </div>
          <div className="flex items-center gap-2">
            <Progress value={course.progress} className="w-32" />
            <span className="text-sm font-medium">{course.progress}%</span>
          </div>
        </div>
      </div>

      {/* Lesson Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {currentLesson.type === 'theory' ? (
                  <BookOpen className="h-5 w-5 text-blue-500" />
                ) : (
                  <Code className="h-5 w-5 text-green-500" />
                )}
                <div>
                  <h3 className="font-semibold">{currentLesson.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {currentLesson.duration} min
                    </span>
                    <Badge variant={currentLesson.type === 'theory' ? 'outline' : 'default'}>
                      {currentLesson.type === 'theory' ? 'Theory' : 'Exercise'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {completedLessons} of {totalLessons} completed
              </span>
              {currentLesson.completed && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lesson Content */}
      {currentLesson.type === 'theory' ? (
        <Card>
          <CardContent className="p-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: currentLesson.content.replace(/\n/g, '<br>') }} />
            </div>
          </CardContent>
        </Card>
      ) : currentLesson.exercise ? (
        <CodeEditor 
          exercise={currentLesson.exercise} 
          onSubmit={handleExerciseSubmit}
        />
      ) : null}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={goToPreviousLesson}
          disabled={!hasPreviousLesson()}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous Lesson
        </Button>

        <div className="flex gap-2">
          {currentLesson.type === 'theory' && !currentLesson.completed && (
            <Button onClick={markLessonComplete}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Complete
            </Button>
          )}
          
          {hasNextLesson() && (
            <Button onClick={goToNextLesson}>
              Next Lesson
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}