-- Add application_fee column to positions table
ALTER TABLE positions 
ADD COLUMN IF NOT EXISTS application_fee DECIMAL(10, 2) DEFAULT 0.00;

-- Add comment
COMMENT ON COLUMN positions.application_fee IS 'Application fee in Ghana Cedis (GHS) for this position';
