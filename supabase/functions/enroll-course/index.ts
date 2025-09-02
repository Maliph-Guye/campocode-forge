import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnrollmentRequest {
  course_id: string;
  payment_verified?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get user from JWT token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { course_id, payment_verified = false }: EnrollmentRequest = await req.json();

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    // Get course details
    const { data: course, error: courseError } = await supabaseClient
      .from('courses')
      .select('id, title, price, is_published')
      .eq('id', course_id)
      .single();

    if (courseError || !course) {
      throw new Error('Course not found');
    }

    if (!course.is_published) {
      throw new Error('Course is not published');
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabaseClient
      .from('enrollments')
      .select('id')
      .eq('user_id', profile.id)
      .eq('course_id', course_id)
      .single();

    if (existingEnrollment) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Already enrolled in this course',
        enrollment_id: existingEnrollment.id,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For paid courses, require payment verification
    if (course.price > 0 && !payment_verified) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment required for this course',
        requires_payment: true,
        course_price: course.price,
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create enrollment
    const { data: enrollment, error: enrollmentError } = await supabaseClient
      .from('enrollments')
      .insert({
        user_id: profile.id,
        course_id: course_id,
        progress_percentage: 0,
      })
      .select()
      .single();

    if (enrollmentError) {
      console.error('Enrollment error:', enrollmentError);
      throw new Error('Failed to enroll in course');
    }

    // Create achievement for first enrollment
    const { data: achievements } = await supabaseClient
      .from('achievements')
      .select('id')
      .eq('user_id', profile.id)
      .eq('category', 'enrollment');

    if (!achievements || achievements.length === 0) {
      await supabaseClient
        .from('achievements')
        .insert({
          user_id: profile.id,
          title: 'First Course Enrollment',
          description: 'Successfully enrolled in your first course!',
          category: 'enrollment',
          badge_icon: '🎯',
        });
    }

    console.log('Successfully enrolled user in course:', { user_id: user.id, course_id, enrollment_id: enrollment.id });

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully enrolled in ${course.title}`,
      enrollment_id: enrollment.id,
      course: {
        id: course.id,
        title: course.title,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Enrollment error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});