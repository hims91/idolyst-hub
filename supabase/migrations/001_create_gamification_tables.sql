
-- Create gamification tables for our application

-- Table for user points
CREATE TABLE public.user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Table for point transactions (history of points earned/spent)
CREATE TABLE public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  transaction_type TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Table for badges
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  points_required INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Table for user badges (which badges users have earned)
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_badge FOREIGN KEY (badge_id) REFERENCES public.badges(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_badge UNIQUE (user_id, badge_id)
);

-- Table for challenges
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  requirements TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for user challenges (which challenges users have joined/completed)
CREATE TABLE public.user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_challenge FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_challenge UNIQUE (user_id, challenge_id)
);

-- Add RLS policies

-- User Points policies
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own points"
  ON public.user_points
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can modify points"
  ON public.user_points
  USING (true);

-- Point Transactions policies
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own point transactions"
  ON public.point_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert point transactions"
  ON public.point_transactions
  USING (true);

-- Badges policies
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are viewable by all users"
  ON public.badges
  FOR SELECT
  USING (true);

-- User Badges policies
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badges"
  ON public.user_badges
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view others' badges"
  ON public.user_badges
  FOR SELECT
  USING (true);

CREATE POLICY "System can modify user badges"
  ON public.user_badges
  USING (true);

-- Challenges policies
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenges are viewable by all users"
  ON public.challenges
  FOR SELECT
  USING (true);

-- User Challenges policies
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own challenges"
  ON public.user_challenges
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenges"
  ON public.user_challenges
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges"
  ON public.user_challenges
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Insert some initial badges
INSERT INTO public.badges (name, description, icon, category, points_required)
VALUES 
  ('First Post', 'Created your first post', 'award', 'achievement', 10),
  ('Influencer', 'Reached 100 followers', 'crown', 'achievement', 500),
  ('Thought Leader', 'Received 50 upvotes on a post', 'star', 'contribution', 200),
  ('Connector', 'Joined 5 communities', 'users', 'contribution', 150),
  ('Active Commenter', 'Made 25 comments', 'message-square', 'contribution', 100),
  ('Idea Machine', 'Created 10 posts', 'lightbulb', 'achievement', 300);

-- Insert some initial challenges
INSERT INTO public.challenges (title, description, points, requirements, start_date, end_date)
VALUES
  (
    'Networking Champion',
    'Connect with 10 new members in your field',
    150,
    'Send connection requests to 10 new members in your industry',
    NOW(),
    NOW() + INTERVAL '7 days'
  ),
  (
    'Content Creator',
    'Publish 5 posts in 7 days',
    200,
    'Create and publish 5 original posts within a week',
    NOW(),
    NOW() + INTERVAL '7 days'
  ),
  (
    'Engagement Expert',
    'Comment on 20 posts from your network',
    100,
    'Leave thoughtful comments on 20 different posts',
    NOW(),
    NOW() + INTERVAL '30 days'
  ),
  (
    'Community Builder',
    'Join 3 communities and participate in discussions',
    175,
    'Join 3 different communities and post at least once in each',
    NOW(),
    NOW() + INTERVAL '30 days'
  ),
  (
    'Feedback Master',
    'Provide quality feedback on 5 startup pitches',
    250,
    'Give detailed feedback on 5 different startup pitches',
    NOW(),
    NOW() + INTERVAL '7 days'
  );

-- Create functions for gamification logic

-- Function to add points to a user
CREATE OR REPLACE FUNCTION public.add_user_points(
  user_id UUID,
  amount INTEGER,
  description TEXT,
  transaction_type TEXT,
  reference_id UUID DEFAULT NULL,
  reference_type TEXT DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert into point_transactions
  INSERT INTO public.point_transactions (
    user_id, 
    amount, 
    description, 
    transaction_type, 
    reference_id, 
    reference_type
  )
  VALUES (
    user_id, 
    amount, 
    description, 
    transaction_type, 
    reference_id, 
    reference_type
  );

  -- Update or insert into user_points
  INSERT INTO public.user_points (user_id, points)
  VALUES (user_id, amount)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    points = public.user_points.points + amount,
    last_updated = now();

  -- Check for badges that can be unlocked
  INSERT INTO public.user_badges (user_id, badge_id)
  SELECT 
    user_id, 
    b.id
  FROM public.badges b
  JOIN public.user_points up ON up.user_id = user_id
  WHERE 
    up.points >= b.points_required
    AND NOT EXISTS (
      SELECT 1 FROM public.user_badges ub 
      WHERE ub.user_id = user_id AND ub.badge_id = b.id
    );
END;
$$;

-- Function to update challenge progress
CREATE OR REPLACE FUNCTION public.update_challenge_progress(
  p_user_id UUID,
  p_challenge_id UUID,
  p_progress INTEGER,
  p_completed BOOLEAN DEFAULT false
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  challenge_record public.challenges%ROWTYPE;
  was_completed BOOLEAN;
BEGIN
  -- Get the challenge details
  SELECT * INTO challenge_record FROM public.challenges WHERE id = p_challenge_id;
  
  -- Check if the challenge exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Challenge not found';
  END IF;

  -- Get existing completion status
  SELECT is_completed INTO was_completed FROM public.user_challenges 
  WHERE user_id = p_user_id AND challenge_id = p_challenge_id;

  -- Update or insert user_challenge
  INSERT INTO public.user_challenges (
    user_id,
    challenge_id,
    progress,
    is_completed,
    completed_at
  )
  VALUES (
    p_user_id,
    p_challenge_id,
    p_progress,
    p_completed,
    CASE WHEN p_completed THEN now() ELSE NULL END
  )
  ON CONFLICT (user_id, challenge_id) 
  DO UPDATE SET 
    progress = GREATEST(public.user_challenges.progress, p_progress),
    is_completed = p_completed OR public.user_challenges.is_completed,
    completed_at = CASE WHEN p_completed AND NOT public.user_challenges.is_completed THEN now() ELSE public.user_challenges.completed_at END;

  -- If newly completed, award points
  IF p_completed AND (was_completed IS NULL OR NOT was_completed) THEN
    PERFORM public.add_user_points(
      p_user_id,
      challenge_record.points,
      'Completed challenge: ' || challenge_record.title,
      'challenge_completed',
      challenge_record.id,
      'challenge'
    );
  END IF;
END;
$$;

-- Create triggers for gamification

-- Trigger to award points when a user creates a post
CREATE OR REPLACE FUNCTION public.award_post_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Award points for creating a post
  PERFORM public.add_user_points(
    NEW.user_id,
    10,  -- Points for creating a post
    'Created a new post',
    'post_created',
    NEW.id,
    'post'
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_post_created
AFTER INSERT ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.award_post_points();

-- Trigger to award points when a user comments
CREATE OR REPLACE FUNCTION public.award_comment_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Award points for creating a comment
  PERFORM public.add_user_points(
    NEW.user_id,
    5,  -- Points for creating a comment
    'Posted a comment',
    'comment_created',
    NEW.id,
    'comment'
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_comment_created
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.award_comment_points();
