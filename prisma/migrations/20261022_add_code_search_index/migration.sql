
CREATE INDEX "RepoFile_content_fts_idx"
ON "RepoFile"
USING GIN (to_tsvector('simple', "content"));
