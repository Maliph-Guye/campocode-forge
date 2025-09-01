import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, LineChart, Activity, TrendingUp, Clock, Target, Award, BookOpen } from 'lucide-react';

const Analytics = () => {
  const weeklyData = [
    { day: 'Mon', hours: 2.5, exercises: 8 },
    { day: 'Tue', hours: 3.2, exercises: 12 },
    { day: 'Wed', hours: 1.8, exercises: 5 },
    { day: 'Thu', hours: 4.1, exercises: 15 },
    { day: 'Fri', hours: 2.9, exercises: 9 },
    { day: 'Sat', hours: 5.5, exercises: 20 },
    { day: 'Sun', hours: 3.8, exercises: 14 }
  ];

  const skillProgress = [
    { skill: 'JavaScript', progress: 85, trend: '+12%' },
    { skill: 'React', progress: 78, trend: '+8%' },
    { skill: 'Python', progress: 92, trend: '+15%' },
    { skill: 'SQL', progress: 65, trend: '+5%' },
    { skill: 'Node.js', progress: 71, trend: '+10%' }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Learning Analytics</h1>
          <p className="text-muted-foreground mt-2">Track your progress and performance insights</p>
        </div>
        <Badge variant="outline" className="px-4 py-2">
          <Activity className="h-4 w-4 mr-2" />
          Last 30 days
        </Badge>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.8 hrs</div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exercises Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">+23% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89.2%</div>
            <p className="text-xs text-muted-foreground">+5.3% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 days</div>
            <p className="text-xs text-muted-foreground">Keep it up! 🔥</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Weekly Activity
            </CardTitle>
            <CardDescription>Your learning activity over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-12 text-sm font-medium">{day.day}</span>
                    <div className="flex-1">
                      <Progress value={(day.hours / 6) * 100} className="h-2" />
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>{day.hours}h</div>
                    <div>{day.exercises} ex</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skill Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Skill Progress
            </CardTitle>
            <CardDescription>Your proficiency across different technologies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skillProgress.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{skill.skill}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-600">{skill.trend}</span>
                      <span className="text-sm text-muted-foreground">{skill.progress}%</span>
                    </div>
                  </div>
                  <Progress value={skill.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Learning Patterns
          </CardTitle>
          <CardDescription>Insights about your learning habits and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2">Peak Learning Time</h3>
              <p className="text-2xl font-bold text-primary">2:00 PM - 4:00 PM</p>
              <p className="text-sm text-muted-foreground">You're most productive in the afternoon</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2">Preferred Session Length</h3>
              <p className="text-2xl font-bold text-primary">45 minutes</p>
              <p className="text-sm text-muted-foreground">Optimal focus duration for you</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2">Strongest Subject</h3>
              <p className="text-2xl font-bold text-primary">Python</p>
              <p className="text-sm text-muted-foreground">92% average score</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;