
class Conflict {
    constructor({ conflict_id, submission_id, canon_id, has_conflict = true, category = null, severity = null, confidence = null, supporting_evidence = [], retrieved_canon_facts = null, reasoning = null, status = 'open', created_at = null, updated_at = null }) {
        this.conflict_id   = conflict_id;
        this.submission_id = submission_id;
        this.canon_id      = canon_id;
        this.has_conflict  = has_conflict;
        this.category      = category;
        this.severity      = severity;
        this.confidence    = confidence;
        this.supporting_evidence = supporting_evidence;
        this.retrieved_canon_facts = retrieved_canon_facts;
        this.reasoning     = reasoning;
        this.status        = status;
        this.created_at    = created_at;
        this.updated_at    = updated_at;
    }
}

export default Conflict;
