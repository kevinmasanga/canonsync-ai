class Conflict {
    constructor({ conflict_id, submission_id, canon_id, confidence, reasoning, status, created_at }) {
        this.conflict_id = conflict_id;
        this.submission_id = submission_id;
        this.canon_id = canon_id;
        this.confidence = confidence;
        this.reasoning = reasoning;
        this.status = status;
        this.created_at = created_at;
    }
}

export default Conflict;
