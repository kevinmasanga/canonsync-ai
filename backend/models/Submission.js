class Submission {
    constructor({ submission_id, show_id, script, status, author_name, created_at }) {
        this.submission_id = submission_id;
        this.show_id = show_id;
        this.script = script;
        this.status = status;
        this.author_name = author_name;
        this.created_at = created_at;
    }
}

export default Submission;
