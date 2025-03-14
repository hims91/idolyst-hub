
-- Create functions for gamification logic

-- Function to get leaderboard data
CREATE OR REPLACE FUNCTION public.get_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  user_avatar TEXT,
  points INTEGER,
  badge_count INTEGER,
  rank INTEGER
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  WITH user_points_ranked AS (
    SELECT
      up.user_id,
      up.points,
      COUNT(ub.id) AS badge_count,
      RANK() OVER (ORDER BY up.points DESC) AS rank
    FROM user_points up
    LEFT JOIN user_badges ub ON up.user_id = ub.user_id
    GROUP BY up.user_id, up.points
  )
  SELECT
    upr.user_id,
    au.raw_user_meta_data->>'name' AS user_name,
    au.raw_user_meta_data->>'avatar_url' AS user_avatar,
    upr.points,
    upr.badge_count,
    upr.rank
  FROM user_points_ranked upr
  JOIN auth.users au ON upr.user_id = au.id
  ORDER BY upr.rank ASC
  LIMIT limit_count;
$$;

-- Function to get user gamification stats
CREATE OR REPLACE FUNCTION public.get_user_gamification_stats(p_user_id UUID)
RETURNS TABLE (
  points INTEGER,
  badge_count INTEGER,
  challenge_count INTEGER,
  completed_challenge_count INTEGER,
  rank INTEGER
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT
    up.points,
    (SELECT COUNT(*) FROM user_badges WHERE user_id = p_user_id) AS badge_count,
    (SELECT COUNT(*) FROM user_challenges WHERE user_id = p_user_id) AS challenge_count,
    (SELECT COUNT(*) FROM user_challenges WHERE user_id = p_user_id AND is_completed = true) AS completed_challenge_count,
    (
      SELECT rank FROM (
        SELECT user_id, RANK() OVER (ORDER BY points DESC) AS rank
        FROM user_points
      ) ranked
      WHERE user_id = p_user_id
    ) AS rank
  FROM user_points up
  WHERE up.user_id = p_user_id;
$$;

-- Function to check and award user badges based on activity
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_points INTEGER;
BEGIN
  -- Get current user points
  SELECT points INTO user_points FROM user_points WHERE user_id = p_user_id;
  
  -- If user has no points record yet, exit
  IF user_points IS NULL THEN
    RETURN;
  END IF;
  
  -- Insert badges that user qualifies for but doesn't have yet
  INSERT INTO user_badges (user_id, badge_id)
  SELECT 
    p_user_id, 
    b.id
  FROM badges b
  WHERE 
    b.points_required <= user_points
    AND NOT EXISTS (
      SELECT 1 FROM user_badges ub 
      WHERE ub.user_id = p_user_id AND ub.badge_id = b.id
    );
END;
$$;

-- Create a trigger to check for new badges whenever points are updated
CREATE OR REPLACE FUNCTION public.trigger_check_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.check_and_award_badges(NEW.user_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_points_updated
AFTER UPDATE ON public.user_points
FOR EACH ROW
EXECUTE FUNCTION public.trigger_check_badges();

CREATE TRIGGER on_points_inserted
AFTER INSERT ON public.user_points
FOR EACH ROW
EXECUTE FUNCTION public.trigger_check_badges();

-- Utility function to add points and record the transaction in one call
CREATE OR REPLACE FUNCTION public.add_points_and_check_badges(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_transaction_type TEXT,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert points transaction
  INSERT INTO point_transactions (
    user_id, 
    amount, 
    description, 
    transaction_type, 
    reference_id, 
    reference_type
  )
  VALUES (
    p_user_id, 
    p_amount, 
    p_description, 
    p_transaction_type, 
    p_reference_id, 
    p_reference_type
  );

  -- Update or insert user points
  INSERT INTO user_points (user_id, points)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    points = user_points.points + p_amount,
    last_updated = now();
    
  -- Badges will be checked via the trigger on user_points
END;
$$;
