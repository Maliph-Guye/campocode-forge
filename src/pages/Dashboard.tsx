import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Trophy, TrendingUp, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Maliph from '@/components/Maliph';

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Mock data - in a real app, this would come from your API
  const stats = {
    coursesEnrolled: 5,
    coursesCompleted: 2,
    hoursLearned: 47,
    currentStreak: 12,
    achievements: 8,
  };

  const recentCourses = [
    {
      id: '1',
      title: 'JavaScript Fundamentals',
      progress: 75,
      lastAccessed: '2 hours ago',
      category: 'Web Development',
      difficulty: 'Beginner',
    },
    {
      id: '2',
      title: 'React Hooks Deep Dive',
      progress: 30,
      lastAccessed: '1 day ago',
      category: 'Frontend',
      difficulty: 'Intermediate',
    },
    {
      id: '3',
      title: 'Node.js Backend Development',
      progress: 10,
      lastAccessed: '3 days ago',
      category: 'Backend',
      difficulty: 'Advanced',
    },
  ];

  const achievements = [
    { title: 'First Course Completed', icon: '🎓', earned: true },
    { title: '7-Day Streak', icon: '🔥', earned: true },
    { title: '10 Exercises Solved', icon: '💻', earned: true },
    { title: 'Code Master', icon: '👑', earned: false },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {profile?.full_name || profile?.username || 'Developer'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Continue your coding journey and level up your skills.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Enrolled</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.coursesEnrolled}</div>
            <p className="text-xs text-muted-foreground">
              {stats.coursesCompleted} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Learned</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hoursLearned}h</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <p className="text-xs text-muted-foreground">
              days in a row
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.achievements}</div>
            <p className="text-xs text-muted-foreground">
              badges earned
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Continue Learning</CardTitle>
              <CardDescription>
                Pick up where you left off in your courses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{course.title}</h3>
                      <Badge className={getDifficultyColor(course.difficulty)}>
                        {course.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{course.category}</span>
                      <span>•</span>
                      <span>Last accessed {course.lastAccessed}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-4"
                    onClick={() => navigate(`/learning/${course.id}`)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Continue
                  </Button>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/courses')}
              >
                Browse All Courses
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
              <CardDescription>
                Your latest accomplishments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    achievement.earned
                      ? 'border-primary/20 bg-primary/5'
                      : 'border-muted bg-muted/30 opacity-50'
                  }`}
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {achievement.earned ? 'Earned' : 'Locked'}
                    </p>
                  </div>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/achievements')}
              >
                View All Achievements
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Maliph Chatbot */}
      <Maliph context="Dashboard overview and learning progress assistance" />
    </div>
  );
}