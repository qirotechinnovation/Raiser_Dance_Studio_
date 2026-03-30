-- INSERT DATA FROM "sangeet lead weding coreo graphiy.txt"
INSERT INTO sangeet_package (id, name, details, price, number_of_dances, theme, billing_cycle, duration)
VALUES (
    1001, 
    'Sangeet Lead Wedding Choreography', 
    'as form for studio . photo', 
    5000.00, -- Placeholder price
    5, -- Placeholder number of dances
    'Wedding', 
    'ONE_TIME', 
    '1 Week'
);

-- TEMPLATES FOR DATA FROM "Raisers brochure ff.pdf" (Sangeet Packages)
-- Please replace the placeholders with actual values from the PDF.
-- INSERT INTO sangeet_package (id, name, details, price, number_of_dances, theme, billing_cycle, duration)
-- VALUES (1002, 'Package Name', 'Description from Brochure', 10000.00, 10, 'Theme Name', 'ONE_TIME', '2 Weeks');
-- INSERT INTO sangeet_package (id, name, details, price, number_of_dances, theme, billing_cycle, duration)
-- VALUES (1003, 'Another Package', 'Description...', 15000.00, 15, 'Theme', 'ONE_TIME', '3 Weeks');


-- TEMPLATES FOR DATA FROM "Raiser’s fees structure .pdf"
-- Update Fee Settings (General Fees)
-- Please replace values with those from the Fees PDF.
/*
UPDATE fee_settings 
SET 
    admission_fee = 200.00, 
    monthly_fee = 1600.00, 
    quarterly_fee = 4500.00, 
    half_yearly_fee = 8500.00, 
    yearly_fee = 16000.00, 
    private_class_fee = 1000.00 
WHERE id = 1; 
*/

-- Insert Fee Structures (Specific Plans if any)
-- INSERT INTO fee_structure (id, plan, amount, discount_percent) VALUES (1, 'Monthly', 1600.00, 0);
-- INSERT INTO fee_structure (id, plan, amount, discount_percent) VALUES (2, 'Quarterly', 4500.00, 5);
-- INSERT INTO fee_structure (id, plan, amount, discount_percent) VALUES (3, 'Yearly', 16000.00, 10);


-- NOTE: General Info from "Raisers .pdf"
-- There is no dedicated table found for "About Us" or general text content in the current schema.
-- This information is currently hardcoded in 'src/screens/student/StudioInfoScreen.js'.
-- To store this in the database, a new table (e.g., 'studio_info') would need to be created.
