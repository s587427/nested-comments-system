import { usePost } from "../contexts/PostContext"
import { CommentList } from "./CommentList";

export function Post() {
    const { post, rootComments } = usePost()

    console.log(post, rootComments);
    return <>
        <h1>{post.title}</h1>
        <article>{post.body}</article>
        <h3>留言</h3>
        <section>
            <CommentList rootComments={rootComments} />
        </section>
    </>
}