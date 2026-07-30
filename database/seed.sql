-- ==================================================
-- CanonSync AI Seed Data
-- ==================================================

-- ==================================================
-- Shows
-- ==================================================

INSERT INTO shows (
    show_id,
    title,
    description
)
VALUES (
    'd4b43fd2-9d3b-4d79-9b53-3d82d5d4c001',
    'Kingdom of Ashes',
    'A fantasy drama following Prince Kael as he attempts to unite five rival kingdoms after the disappearance of the legendary Fire Crown.'
);

-- ==================================================
-- Canon Facts
-- ==================================================

INSERT INTO canon_facts (
    canon_id,
    show_id,
    category,
    fact_text,
    source_episode,
    author_name
)
VALUES
(
    'e8e7d0c1-2d6e-4c87-b82d-11f9d4c10001',
    'd4b43fd2-9d3b-4d79-9b53-3d82d5d4c001',
    'Character',
    'Prince Kael is the eldest son of King Aldren.',
    'Episode 1',
    'Story Editor'
),

(
    'e8e7d0c1-2d6e-4c87-b82d-11f9d4c10002',
    'd4b43fd2-9d3b-4d79-9b53-3d82d5d4c001',
    'Character',
    'Prince Kael was born in Ravenshollow.',
    'Episode 1',
    'Story Editor'
),

(
    'e8e7d0c1-2d6e-4c87-b82d-11f9d4c10003',
    'd4b43fd2-9d3b-4d79-9b53-3d82d5d4c001',
    'Character',
    'Queen Elara died in the year 1018 A.E.',
    'Episode 2',
    'Story Editor'
),

(
    'e8e7d0c1-2d6e-4c87-b82d-11f9d4c10004',
    'd4b43fd2-9d3b-4d79-9b53-3d82d5d4c001',
    'Location',
    'Ravenshollow is the capital city of Ashfall Kingdom.',
    'Episode 1',
    'Story Editor'
),

(
    'e8e7d0c1-2d6e-4c87-b82d-11f9d4c10005',
    'd4b43fd2-9d3b-4d79-9b53-3d82d5d4c001',
    'Artifact',
    'The Fire Crown disappeared in the year 1024 A.E.',
    'Episode 1',
    'Story Editor'
),

(
    'e8e7d0c1-2d6e-4c87-b82d-11f9d4c10006',
    'd4b43fd2-9d3b-4d79-9b53-3d82d5d4c001',
    'Artifact',
    'Only descendants of House Ember can wield the Fire Crown.',
    'Episode 3',
    'Story Editor'
),

(
    'e8e7d0c1-2d6e-4c87-b82d-11f9d4c10007',
    'd4b43fd2-9d3b-4d79-9b53-3d82d5d4c001',
    'Character',
    'General Thorne lost his left eye during the Battle of Black Pass.',
    'Episode 4',
    'Story Editor'
);

-- ==================================================
-- Scene Submission
-- ==================================================

INSERT INTO submissions (
    submission_id,
    show_id,
    script,
    status,
    author_name
)
VALUES (
    'fa7c1f0d-48e6-4b2b-8d8b-c2d5b9b20001',
    'd4b43fd2-9d3b-4d79-9b53-3d82d5d4c001',
$$
INT. THRONE ROOM - DAY

Queen Elara walks into the throne room carrying the legendary Fire Crown.

She places the crown on Prince Kael''s head during her coronation ceremony while the royal court applauds.
$$,
    'processed',
    'Writer A'
);

-- ==================================================
-- AI Conflict Report
-- ==================================================

INSERT INTO conflicts (
    conflict_id,
    submission_id,
    canon_id,
    confidence,
    reasoning,
    status
)
VALUES
(
    'bb43e3f7-f27f-4d91-96d8-0d7f61000001',
    'fa7c1f0d-48e6-4b2b-8d8b-c2d5b9b20001',
    'e8e7d0c1-2d6e-4c87-b82d-11f9d4c10003',
    0.98,
    'Canon states that Queen Elara died in 1018 A.E., making her appearance in this scene a continuity contradiction.',
    'open'
),
(
    'bb43e3f7-f27f-4d91-96d8-0d7f61000002',
    'fa7c1f0d-48e6-4b2b-8d8b-c2d5b9b20001',
    'e8e7d0c1-2d6e-4c87-b82d-11f9d4c10005',
    0.96,
    'Canon establishes that the Fire Crown disappeared in 1024 A.E., yet it is used during this scene.',
    'open'
);