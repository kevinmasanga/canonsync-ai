-- ==================================================
-- CanonSync AI Seed Data
-- ==================================================

-- ==================================================
-- Shows
-- ==================================================

INSERT INTO shows (
    title,
    description
)
VALUES (
    'The Legend of Korra',
    'A fantasy adventure series set in a world where individuals can manipulate the elements. 
    Avatar Korra strives to maintain balance while confronting political unrest, spiritual threats, 
    and powerful adversaries in a rapidly changing world.'
);

-- ==================================================
-- Canon Facts
-- ==================================================

INSERT INTO canon_facts (
    category,
    fact_text,
    source_episode,
    author_name
)
VALUES
(
    'Character',
    'Avatar Korra was born into the Southern Water Tribe and is the successor to Avatar Aang.',
    'S01E01',
    'Brian'
),

(
    'Location',
    'Republic City was founded as a place where people from all four nations could live together peacefully.',
    'S01E01',
    'Elly'
),

(
    'Relationship',
    'Tenzin is the son of Avatar Aang and serves as Korra''s airbending teacher.',
    'S01E01',
    'Kevin'
),

(
    'Organization',
    'The Equalists are led by Amon and oppose the existence of bending in society.',
    'S01E03',
    'Dickson'
),

(
    'Character',
    'Asami Sato is the daughter of Hiroshi Sato and the CEO of Future Industries.',
    'S01E07',
    'Brian'
),

(
    'Spirit',
    'Raava is the spirit of light and peace who remains permanently bonded with the Avatar.',
    'S02E08',
    'Elly'
);

-- ==================================================
-- Scene Submissions
-- ==================================================

INSERT INTO submissions (
    script,
    author_name
)
VALUES
(
$$
Korra arrives in Republic City and begins training under Tenzin to master airbending while adapting to life in the city.
$$,
'Kevin'
),

(
$$
Avatar Aang personally welcomes Korra to Republic City and begins teaching her airbending alongside Tenzin.
$$,
'Dickson'
),

(
$$
Amon publicly declares that all citizens should abandon bending and officially announces himself as the leader of the Equalists.
$$,
'Brian'
),

(
$$
Asami Sato introduces herself as the daughter of Tenzin and explains that she inherited Air Temple Island from her father.
$$,
'Elly'
);