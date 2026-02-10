-- Function to delete all ads for a specific user (bypasses RLS)
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION admin_delete_user_ads(target_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER -- This makes the function run with the privileges of the user who created it (bypasses RLS)
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete all ads for the target user
  DELETE FROM anuncios
  WHERE user_id = target_user_id;
  
  -- Get the number of deleted rows
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Return the count
  RETURN deleted_count;
END;
$$;

-- Grant execute permission to authenticated users (the service key will use this)
GRANT EXECUTE ON FUNCTION admin_delete_user_ads(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_delete_user_ads(UUID) TO service_role;
