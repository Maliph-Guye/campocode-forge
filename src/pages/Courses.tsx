import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Clock, Star, Users, Play, BookOpen, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Courses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const navigate = useNavigate();

  // Mock data - in a real app, this would come from your API
  const courses = [
    {
      id: '1',
      title: 'JavaScript Fundamentals',
      description: 'Learn the core concepts of JavaScript programming language',
      thumbnail: '/placeholder.svg',
      category: 'Web Development',
      difficulty: 'Beginner',
      duration: '8 hours',
      rating: 4.8,
      students: 12543,
      price: 0,
      enrolled: true,
      progress: 75,
      instructor: { name: 'John Doe', avatar: '' }
    },
    {
      id: '2',
      title: 'React Hooks Deep Dive',
      description: 'Master React Hooks and modern React patterns',
      thumbnail: '/placeholder.svg',
      category: 'Frontend',
      difficulty: 'Intermediate',
      duration: '12 hours',
      rating: 4.9,
      students: 8932,
      price: 49.99,
      enrolled: true,
      progress: 30,
      instructor: { name: 'Jane Smith', avatar: '' }
    },
    {
      id: '3',
      title: 'Node.js Backend Development',
      description: 'Build scalable backend applications with Node.js',
      thumbnail: '/placeholder.svg',
      category: 'Backend',
      difficulty: 'Advanced',
      duration: '16 hours',
      rating: 4.7,
      students: 6721,
      price: 79.99,
      enrolled: false,
      progress: 0,
      instructor: { name: 'Mike Johnson', avatar: '' }
    },
    {
      id: '4',
      title: 'Python for Beginners',
      description: 'Start your programming journey with Python',
      thumbnail: '/placeholder.svg',
      category: 'Programming',
      difficulty: 'Beginner',
      duration: '10 hours',
      rating: 4.6,
      students: 15234,
      price: 0,
      enrolled: false,
      progress: 0,
      instructor: { name: 'Sarah Wilson', avatar: '' }
    },
    {
      id: '5',
      title: 'Data Structures & Algorithms',
      description: 'Master fundamental CS concepts for technical interviews',
      thumbnail: '/placeholder.svg',
      category: 'Computer Science',
      difficulty: 'Advanced',
      duration: '20 hours',
      rating: 4.9,
      students: 9876,
      price: 99.99,
      enrolled: false,
      progress: 0,
      instructor: { name: 'David Chen', avatar: '' }
    },
    {
      id: '6',
      title: 'CSS Grid & Flexbox',
      description: 'Modern CSS layout techniques for responsive design',
      thumbnail: '/placeholder.svg',
      category: 'Web Development',
      difficulty: 'Intermediate',
      duration: '6 hours',
      rating: 4.5,
      students: 7543,
      price: 29.99,
      enrolled: false,
      progress: 0,
      instructor: { name: 'Emily Brown', avatar: '' }
    },
  ];

  const categories = ['all', 'Web Development', 'Frontend', 'Backend', 'Programming', 'Computer Science'];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || course.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const handleEnrollOrContinue = (course: any) => {
    if (course.enrolled) {
      navigate(`/learning/${course.id}`);
    } else {
      // Handle enrollment logic
      console.log('Enrolling in course:', course.id);
      // In a real app, you'd make an API call here
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Courses</h1>
        <p className="text-muted-foreground">
          Explore our comprehensive library of programming courses
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map(difficulty => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty === 'all' ? 'All Levels' : difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className={getDifficultyColor(course.difficulty)}>
                    {course.difficulty}
                  </Badge>
                  <Badge variant="outline">{course.category}</Badge>
                </div>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription className="text-sm">
                  {course.description}
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {course.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current" />
                  {course.rating}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course.students.toLocaleString()}
                </div>
              </div>

              {course.enrolled && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  by {course.instructor.name}
                </div>
                <div className="text-lg font-bold text-primary">
                  {course.price === 0 ? 'Free' : `$${course.price}`}
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleEnrollOrContinue(course)}
                variant={course.enrolled ? "default" : "outline"}
              >
                {course.enrolled ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Continue Learning
                  </>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4 mr-2" />
                    {course.price === 0 ? 'Enroll Free' : 'Enroll Now'}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No courses found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or browse all courses
          </p>
        </div>
      )}
    </div>
  );
}