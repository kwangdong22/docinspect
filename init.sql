CREATE TABLE documents (
    id                UUID PRIMARY KEY,
    original_filename TEXT NOT NULL,
    mime_type         TEXT NOT NULL,
    file_extension    TEXT NOT NULL,
    file_size_bytes   BIGINT NOT NULL,
    sha256            TEXT NOT NULL UNIQUE,

    page_count        INTEGER,
    word_count        INTEGER,
    character_count   INTEGER,

    emails            TEXT[] DEFAULT '{}',
    phones            TEXT[] DEFAULT '{}',
    links             TEXT[] DEFAULT '{}',

    has_tables        BOOLEAN DEFAULT FALSE,
    has_images        BOOLEAN DEFAULT FALSE,

    extraction_status TEXT NOT NULL DEFAULT 'success',
    cached            BOOLEAN DEFAULT FALSE,

    processed_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX documents_file_extension_idx ON documents (file_extension);
CREATE INDEX documents_mime_type_idx      ON documents (mime_type);
CREATE INDEX documents_sha256_idx         ON documents (sha256);

