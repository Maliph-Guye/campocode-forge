import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, CheckCircle, Lock, Star, Zap, Code, BookOpen, Clock, Award } from 'lucide-react';

export default function Achievements() {
  // Mock data - in a real app, this would come from your API
  const achievements = [
    {
      id: '1',
      title: 'Welcome to CampoCode',
      description: 'Complete your first lesson',
      icon: '🎉',
      category: 'Getting Started',
      progress: 100,
      maxProgress: 1,
      earned: true,
      earnedAt: '2024-01-15',
      points: 10,
    },
    {
      id: '2',
      title: 'First Steps',
      description: 'Complete your first course',
      icon: '👣',
      category: 'Learning',
      progress: 100,
      maxProgress: 1,
      earned: true,
      earnedAt: '2024-01-20',
      points: 50,
    },
    {
      id: '3',
      title: 'Code Warrior',
      description: 'Solve 10 coding exercises',
      icon: '⚔️',
      category: 'Coding',
      progress: 7,
      maxProgress: 10,
      earned: false,
      points: 100,
    },
    {
      id: '4',
      title: 'Speed Demon',
      description: 'Complete a lesson in under 10 minutes',
      icon: '⚡',
      category: 'Speed',
      progress: 100,
      maxProgress: 1,
      earned: true,
      earnedAt: '2024-01-22',
      points: 25,
    },
    {
      id: '5',
      title: 'Marathon Runner',
      description: 'Study for 7 consecutive days',
      icon: '🏃‍♂️',
      category: 'Consistency',
      progress: 5,
      maxProgress: 7,
      earned: false,
      points: 75,
    },
    {
      id: '6',
      title: 'JavaScript Master',
      description: 'Complete all JavaScript courses',
      icon: '🚀',
      category: 'Mastery',
      progress: 3,
      maxProgress: 5,
      earned: false,
      points: 200,
    },
    {
      id: '7',
      title: 'Perfectionist',
      description: 'Score 100% on 5 exercises',
      icon: '💯',
      category: 'Excellence',
      progress: 2,
      maxProgress: 5,
      earned: false,
      points: 150,
    },
    {
      id: '8',
      title: 'Night Owl',
      description: 'Complete a lesson after 10 PM',
      icon: '🦉',
      category: 'Special',
      progress: 0,
      maxProgress: 1,
      earned: false,
      points: 20,
    },
    {
      id: '9',
      title: 'Early Bird',
      description: 'Complete a lesson before 7 AM',
      icon: '🐦',
      category: 'Special',
      progress: 0,
      maxProgress: 1,
      earned: false,
      points: 20,
    },
    {
      id: '10',
      title: 'Century Club',
      description: 'Complete 100 lessons',
      icon: '💯',
      category: 'Milestone',
      progress: 45,
      maxProgress: 100,
      earned: false,
      points: 500,
    },
  ];

  const categories = [
    { name: 'All', icon: Trophy, count: achievements.length },
    { name: 'Getting Started', icon: Target, count: achievements.filter(a => a.category === 'Getting Started').length },
    { name: 'Learning', icon: BookOpen, count: achievements.filter(a => a.category === 'Learning').length },
    { name: 'Coding', icon: Code, count: achievements.filter(a => a.category === 'Coding').length },
    { name: 'Speed', icon: Zap, count: achievements.filter(a => a.category === 'Speed').length },
    { name: 'Consistency', icon: Clock, count: achievements.filter(a => a.category === 'Consistency').length },
    { name: 'Mastery', icon: Award, count: achievements.filter(a => a.category === 'Mastery').length },
    { name: 'Excellence', icon: Star, count: achievements.filter(a => a.category === 'Excellence').length },
    { name: 'Special', icon: Trophy, count: achievements.filter(a => a.category === 'Special').length },
    { name: 'Milestone', icon: Target, count: achievements.filter(a => a.category === 'Milestone').length },
  ];

  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredAchievements = selectedCategory === 'All' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const earnedAchievements = achievements.filter(a => a.earned);
  const totalPoints = earnedAchievements.reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Achievements</h1>
        <p className="text-muted-foreground">
          Track your progress and celebrate your accomplishments
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnedAchievements.length}</div>
            <p className="text-xs text-muted-foreground">
              of {achievements.length} earned
            </p>
            <Progress 
              value={(earnedAchievements.length / achievements.length) * 100} 
              className="mt-2 h-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievement Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints}</div>
            <p className="text-xs text-muted-foreground">
              points earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((earnedAchievements.length / achievements.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              achievements unlocked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Filter achievements by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategory === category.name;
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background hover:bg-muted border-border'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {category.name}
                  <Badge variant="secondary" className="ml-1">
                    {category.count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement) => (
          <Card 
            key={achievement.id} 
            className={`relative transition-all duration-200 ${
              achievement.earned 
                ? 'border-primary/50 bg-primary/5 hover:shadow-lg' 
                : 'opacity-75 hover:opacity-100'
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div>
                    <CardTitle className="text-lg">{achievement.title}</CardTitle>
                    <Badge 
                      variant="outline" 
                      className="mt-1"
                    >
                      {achievement.category}
                    </Badge>
                  </div>
                </div>
                
                {achievement.earned ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <Lock className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {achievement.description}
              </p>
              
              {!achievement.earned && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{achievement.progress} / {achievement.maxProgress}</span>
                  </div>
                  <Progress 
                    value={(achievement.progress / achievement.maxProgress) * 100} 
                    className="h-2" 
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-3 w-3" />
                  {achievement.points} points
                </div>
                
                {achievement.earned && achievement.earnedAt && (
                  <span className="text-xs text-muted-foreground">
                    Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No achievements found</h3>
          <p className="text-muted-foreground">
            Try selecting a different category or start learning to earn your first achievement!
          </p>
        </div>
      )}
    </div>
  );
}