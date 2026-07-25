class CanonFact {
    constructor({ canon_id, show_id, category, fact_text, source_episode, embedding, superseded_by, author_name, created_at }) {
        this.canon_id = canon_id;
        this.show_id = show_id;
        this.category = category;
        this.fact_text = fact_text;
        this.source_episode = source_episode;
        this.embedding = embedding;
        this.superseded_by = superseded_by;
        this.author_name = author_name;
        this.created_at = created_at;
    }
}

export default CanonFact;
