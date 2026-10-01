CREATE TABLE IF NOT EXISTS empresa (
 id integer PRIMARY KEY CHECK (id = 1), dados jsonb NOT NULL
);
ALTER TABLE orcamentos ADD COLUMN IF NOT EXISTS empresa_snapshot jsonb;
ALTER TABLE orcamentos ADD COLUMN IF NOT EXISTS share_token text;
CREATE UNIQUE INDEX IF NOT EXISTS orcamentos_share_token_idx ON orcamentos(share_token);
