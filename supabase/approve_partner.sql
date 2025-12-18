-- Script to approve a partner by email
-- Usage: Replace 'partner@test.com' with the email you used to sign up

UPDATE partners
SET status = 'approved'
WHERE profile_id IN (
    SELECT id FROM profiles WHERE email = 'partner@test.com'
);

-- Verify the update
SELECT p.company_name, p.status, pr.email
FROM partners p
JOIN profiles pr ON p.profile_id = pr.id
WHERE pr.email = 'partner@test.com';
