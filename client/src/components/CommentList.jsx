import { Comment } from "./Comment"

export function CommentList({ rootComments }) {
    return rootComments.map(comment => {
        return (
            <div key={comment.id}>
                <Comment {...comment} />
            </div>
        )
    })
}