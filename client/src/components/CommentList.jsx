import { Comment } from "./Comment"

export function CommentList({ comments }) {
    return comments.map(comment => {
        return (
            <div key={comment.id}>
                <Comment {...comment} />
            </div>
        )
    })
}