import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Code, 
  Play, 
  Trophy, 
  Timer, 
  Zap, 
  Target,
  BookOpen,
  Brain,
  Gamepad2,
  Lightbulb
} from 'lucide-react';
import Maliph from '@/components/Maliph';

const Practice = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('beginner');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const practiceCategories = [
    {
      id: 'algorithms',
      name: 'Algorithms',
      icon: Brain,
      description: 'Sorting, searching, and optimization problems',
      exercises: 45,
      difficulty: 'Intermediate'
    },
    {
      id: 'data-structures',
      name: 'Data Structures',
      icon: Target,
      description: 'Arrays, trees, graphs, and hash tables',
      exercises: 38,
      difficulty: 'Beginner'
    },
    {
      id: 'web-dev',
      name: 'Web Development',
      icon: Code,
      description: 'HTML, CSS, JavaScript, and React challenges',
      exercises: 52,
      difficulty: 'Mixed'
    },
    {
      id: 'python',
      name: 'Python Programming',
      icon: BookOpen,
      description: 'Python syntax, libraries, and best practices',
      exercises: 41,
      difficulty: 'Beginner'
    }
  ];

  const dailyChallenges = [
    {
      title: 'Two Sum Problem',
      difficulty: 'Easy',
      points: 100,
      timeEstimate: '15 min',
      completed: false
    },
    {
      title: 'Binary Tree Traversal',
      difficulty: 'Medium',
      points: 200,
      timeEstimate: '25 min',
      completed: true
    },
    {
      title: 'Dynamic Programming: Fibonacci',
      difficulty: 'Hard',
      points: 300,
      timeEstimate: '35 min',
      completed: false
    }
  ];

  const recentSessions = [
    {
      date: '2024-01-15',
      duration: '45 min',
      exercises: 8,
      score: 92,
      category: 'JavaScript'
    },
    {
      date: '2024-01-14',
      duration: '32 min',
      exercises: 6,
      score: 88,
      category: 'Python'
    },
    {
      date: '2024-01-13',
      duration: '28 min',
      exercises: 5,
      score: 95,
      category: 'Algorithms'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Practice Arena</h1>
          <p className="text-muted-foreground mt-2">Sharpen your skills with interactive coding challenges</p>
        </div>
        <Button className="flex items-center gap-2">
          <Gamepad2 className="h-4 w-4" />
          Start Quick Practice
        </Button>
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="daily">Daily Challenges</TabsTrigger>
          <TabsTrigger value="sessions">Practice Sessions</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-6">
          <div className="flex items-center gap-4">
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="all">All Levels</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="algorithms">Algorithms</SelectItem>
                <SelectItem value="data-structures">Data Structures</SelectItem>
                <SelectItem value="web-dev">Web Development</SelectItem>
                <SelectItem value="python">Python</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {practiceCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <IconComponent className="h-8 w-8 text-primary" />
                      <Badge variant="outline">{category.exercises} exercises</Badge>
                    </div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge className={getDifficultyColor(category.difficulty)}>
                        {category.difficulty}
                      </Badge>
                      <Button size="sm" className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Start
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="daily" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Daily Challenges
              </CardTitle>
              <CardDescription>Complete these challenges to earn bonus points and maintain your streak</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyChallenges.map((challenge, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold flex items-center gap-2">
                        {challenge.title}
                        {challenge.completed && <Badge className="bg-green-100 text-green-800">Completed</Badge>}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(challenge.difficulty)}`}>
                          {challenge.difficulty}
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer className="h-4 w-4" />
                          {challenge.timeEstimate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="h-4 w-4" />
                          {challenge.points} pts
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant={challenge.completed ? "outline" : "default"}
                      disabled={challenge.completed}
                    >
                      {challenge.completed ? "Completed" : "Start Challenge"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Practice Sessions</CardTitle>
                <CardDescription>Your latest coding practice sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSessions.map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{session.category}</div>
                        <div className="text-sm text-muted-foreground">{session.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{session.score}% Score</div>
                        <div className="text-sm text-muted-foreground">
                          {session.exercises} exercises in {session.duration}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
                <CardDescription>Jump into a practice session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Random Challenge
                </Button>
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  Timed Practice (30 min)
                </Button>
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Weekly Contest
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Gamepad2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">47</div>
                <p className="text-xs text-muted-foreground">+12 this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">234</div>
                <p className="text-xs text-muted-foreground">+18 this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">91.5%</div>
                <p className="text-xs text-muted-foreground">+2.3% improvement</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Practice Streak</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8 days</div>
                <p className="text-xs text-muted-foreground">Keep it going! 🔥</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Skill Distribution</CardTitle>
              <CardDescription>Your proficiency across different programming areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { skill: 'Problem Solving', progress: 88 },
                  { skill: 'Data Structures', progress: 76 },
                  { skill: 'Algorithms', progress: 82 },
                  { skill: 'Code Quality', progress: 91 },
                  { skill: 'Time Complexity', progress: 67 }
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{item.skill}</span>
                      <span className="text-sm text-muted-foreground">{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Maliph Chatbot */}
      <Maliph context="Coding practice exercises and challenges assistance" />
    </div>
  );
};

export default Practice;