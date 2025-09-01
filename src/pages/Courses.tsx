import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Users, 
  Play, 
  BookOpen, 
  Award, 
  TrendingUp,
  Code,
  Database,
  Palette,
  Brain
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

// Import generated images
import webDevImage from '@/assets/course-web-dev.jpg';
import pythonImage from '@/assets/course-python.jpg';
import dataScienceImage from '@/assets/course-data-science.jpg';
import mlImage from '@/assets/course-machine-learning.jpg';

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const sampleCourses = [
    {
      id: '1',
      title: 'Complete Web Development Bootcamp',
      description: 'Master HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build full-stack web applications from scratch.',
      category: 'Frontend Development',
      difficulty_level: 'beginner',
      price: 89.99,
      instructor_id: '1',
      is_published: true,
      thumbnail_url: webDevImage,
      created_at: '2024-01-15',
      updated_at: '2024-01-15',
      instructor: {
        full_name: 'Sarah Johnson',
        avatar_url: '',
        bio: 'Senior Full-Stack Developer with 8+ years experience'
      },
      stats: {
        students: 12847,
        rating: 4.8,
        reviews: 2341,
        duration: '42 hours',
        lessons: 156,
        exercises: 89
      }
    },
    {
      id: '2',
      title: 'Python Programming Masterclass',
      description: 'Learn Python from basics to advanced topics. Cover data structures, algorithms, web scraping, and automation.',
      category: 'Backend Development',
      difficulty_level: 'intermediate',
      price: 79.99,
      instructor_id: '2',
      is_published: true,
      thumbnail_url: pythonImage,
      created_at: '2024-01-10',
      updated_at: '2024-01-10',
      instructor: {
        full_name: 'Dr. Michael Chen',
        avatar_url: '',
        bio: 'Python Expert & Data Science Consultant'
      },
      stats: {
        students: 8932,
        rating: 4.9,
        reviews: 1876,
        duration: '38 hours',
        lessons: 124,
        exercises: 67
      }
    },
    {
      id: '3',
      title: 'Data Science & Analytics',
      description: 'Master data analysis, visualization, and machine learning with Python, Pandas, NumPy, and Scikit-learn.',
      category: 'Data Science',
      difficulty_level: 'intermediate',
      price: 99.99,
      instructor_id: '3',
      is_published: true,
      thumbnail_url: dataScienceImage,
      created_at: '2024-01-08',
      updated_at: '2024-01-08',
      instructor: {
        full_name: 'Lisa Rodriguez',
        avatar_url: '',
        bio: 'Senior Data Scientist at Tech Corp'
      },
      stats: {
        students: 6521,
        rating: 4.7,
        reviews: 1234,
        duration: '45 hours',
        lessons: 167,
        exercises: 92
      }
    },
    {
      id: '4',
      title: 'Machine Learning Fundamentals',
      description: 'Dive deep into ML algorithms, neural networks, and AI. Build real-world projects using TensorFlow and PyTorch.',
      category: 'Machine Learning',
      difficulty_level: 'advanced',
      price: 129.99,
      instructor_id: '4',
      is_published: true,
      thumbnail_url: mlImage,
      created_at: '2024-01-05',
      updated_at: '2024-01-05',
      instructor: {
        full_name: 'Prof. David Kim',
        avatar_url: '',
        bio: 'AI Research Scientist & University Professor'
      },
      stats: {
        students: 4267,
        rating: 4.9,
        reviews: 987,
        duration: '52 hours',
        lessons: 189,
        exercises: 134
      }
    }
  ];

  useEffect(() => {
    fetchCourses();
    if (user) {
      fetchEnrollments();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      // For now, use sample data instead of Supabase
      setCourses(sampleCourses);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses(sampleCourses);
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    if (!profile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('course_id, progress_percentage')
        .eq('user_id', profile.id);

      if (error) throw error;
      setEnrollments(data || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || course.difficulty_level === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'frontend development': return Code;
      case 'backend development': return Database;
      case 'data science': return TrendingUp;
      case 'machine learning': return Brain;
      default: return BookOpen;
    }
  };

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to enroll in courses.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    try {
      // Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', courseId)
        .eq('user_id', profile?.id)
        .single();

      if (existingEnrollment) {
        toast({
          title: 'Already Enrolled',
          description: 'You are already enrolled in this course.',
          variant: 'destructive',
        });
        return;
      }

      // Create enrollment
      const { error } = await supabase
        .from('enrollments')
        .insert({
          course_id: courseId,
          user_id: profile?.id,
          progress_percentage: 0
        });

      if (error) {
        toast({
          title: 'Enrollment Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Successfully Enrolled!',
          description: 'You can now access the course content.',
        });
        navigate(`/learning/${courseId}`);
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast({
        title: 'Enrollment Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const isEnrolled = (courseId: string) => {
    return enrollments.some(enrollment => enrollment.course_id === courseId);
  };

  const getProgress = (courseId: string) => {
    const enrollment = enrollments.find(e => e.course_id === courseId);
    return enrollment?.progress_percentage || 0;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Learn. Code. Excel.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Master cutting-edge technologies with our expert-crafted courses. From beginner-friendly tutorials to advanced masterclasses.
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-background to-muted/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search courses, technologies, skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-64 h-12">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Frontend Development">Frontend Development</SelectItem>
                <SelectItem value="Backend Development">Backend Development</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="Machine Learning">Machine Learning</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full md:w-48 h-12">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="enrolled">My Courses</TabsTrigger>
          <TabsTrigger value="free">Free</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">All Courses ({filteredCourses.length})</h2>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">Filter applied</span>
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or explore different categories
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => {
                const CategoryIcon = getCategoryIcon(course.category);
                const enrolled = isEnrolled(course.id);
                const progress = getProgress(course.id);
                
                return (
                  <Card key={course.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className="relative">
                      {course.thumbnail_url && (
                        <div className="aspect-video overflow-hidden">
                          <img 
                            src={course.thumbnail_url} 
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <Badge className={getDifficultyColor(course.difficulty_level)}>
                          {course.difficulty_level}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <div className="bg-black/70 text-white px-2 py-1 rounded text-sm font-semibold">
                          ${course.price}
                        </div>
                      </div>
                      {enrolled && (
                        <div className="absolute bottom-4 left-4">
                          <Badge className="bg-green-600 text-white">
                            Enrolled
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                          {course.title}
                        </CardTitle>
                        <CategoryIcon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                      </div>
                      <CardDescription className="text-sm line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {course.stats && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{course.stats.students.toLocaleString()} students</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{course.stats.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span>{course.stats.rating} ({course.stats.reviews})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span>{course.stats.lessons} lessons</span>
                          </div>
                        </div>
                      )}
                      
                      {enrolled && progress > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 pt-2 border-t">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={course.instructor?.avatar_url} />
                          <AvatarFallback>
                            {course.instructor?.full_name?.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {course.instructor?.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {course.instructor?.bio}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          onClick={() => enrolled ? navigate(`/learning/${course.id}`) : handleEnroll(course.id)} 
                          className="flex-1"
                        >
                          {enrolled ? (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Continue Learning
                            </>
                          ) : (
                            <>
                              <BookOpen className="h-4 w-4 mr-2" />
                              Enroll Now
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => navigate(`/learning/${course.id}`)}
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="enrolled" className="space-y-6">
          <h2 className="text-2xl font-bold">My Enrolled Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.filter(course => isEnrolled(course.id)).map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{getProgress(course.id)}%</span>
                    </div>
                    <Progress value={getProgress(course.id)} className="h-2" />
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    onClick={() => navigate(`/learning/${course.id}`)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Continue Learning
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="free" className="space-y-6">
          <h2 className="text-2xl font-bold">Free Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Free courses would be filtered here */}
            <div className="col-span-full text-center py-12">
              <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No free courses available</h3>
              <p className="text-muted-foreground">Check back later for free course offerings</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="popular" className="space-y-6">
          <h2 className="text-2xl font-bold">Popular Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.slice(0, 6).map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <Badge className={getDifficultyColor(course.difficulty_level)}>
                      {course.difficulty_level}
                    </Badge>
                    <span className="font-bold text-primary">${course.price}</span>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => handleEnroll(course.id)}
                  >
                    Enroll Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="new" className="space-y-6">
          <h2 className="text-2xl font-bold">New Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.slice(0, 3).map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-100 text-blue-800">New</Badge>
                    <Badge className={getDifficultyColor(course.difficulty_level)}>
                      {course.difficulty_level}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                  <Button 
                    className="w-full" 
                    onClick={() => handleEnroll(course.id)}
                  >
                    Enroll Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Courses;