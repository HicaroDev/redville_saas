-- ADD PAYER NAME TO CASHBOOK
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cashbook_entries' AND column_name='payer_name') THEN
    ALTER TABLE cashbook_entries ADD COLUMN payer_name TEXT;
  END IF;
END $$;
