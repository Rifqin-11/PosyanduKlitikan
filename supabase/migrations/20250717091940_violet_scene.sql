/*
  # Create Posyandu Management Schema

  1. New Tables
    - `participants`
      - `id` (uuid, primary key)
      - `no` (integer, auto-increment)
      - `nik` (text, unique)
      - `name` (text)
      - `date_of_birth` (date)
      - `address` (text)
      - `bb` (decimal, weight)
      - `tb` (decimal, height)
      - `lila` (decimal, upper arm circumference)
      - `gds` (decimal, blood sugar)
      - `au` (text, hearing)
      - `immunization` (text)
      - `lp` (decimal, waist circumference)
      - `td` (text, blood pressure)
      - `hb` (decimal, hemoglobin)
      - `chol` (decimal, cholesterol)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `user_id` (uuid, foreign key to auth.users)

  2. Security
    - Enable RLS on `participants` table
    - Add policy for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  no serial UNIQUE,
  nik text UNIQUE NOT NULL,
  name text NOT NULL,
  date_of_birth date NOT NULL,
  address text NOT NULL,
  bb decimal(5,2) DEFAULT 0,
  tb decimal(5,2) DEFAULT 0,
  lila decimal(5,2) DEFAULT 0,
  gds decimal(5,2) DEFAULT 0,
  au text DEFAULT '',
  immunization text DEFAULT '',
  lp decimal(5,2) DEFAULT 0,
  td text DEFAULT '',
  hb decimal(5,2) DEFAULT 0,
  chol decimal(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own participants"
  ON participants
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_nik ON participants(nik);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_participants_updated_at
  BEFORE UPDATE ON participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();