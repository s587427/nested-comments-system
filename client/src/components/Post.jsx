import { usePost } from "../contexts/PostContext"
import { useAsyncFn } from "../hooks/useAsync";
import { createComment } from "../sevices/comments";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";

export function Post() {
    const { post, rootComments } = usePost()
    const { loading, error, execute: createCommentFn } = useAsyncFn(createComment)

    function onCommentCreate(message) {
        return createCommentFn({ postId: post.id, message }).then(comment => {
            console.log(comment)
        })
    }
    console.log({ post, rootComments })
    return <>
        <h1>{post.title}</h1>
        <article>{post.body}</article>
        <h3 className="comments-title">留言</h3>
        <section>
            {rootComments && rootComments.length > 0 && (
                <div className="mt-4">
                    <CommentForm loading={loading} error={error} onSubmit={onCommentCreate} />
                    <CommentList comments={rootComments} />
                </div>
            )}
        </section>
    </>
}