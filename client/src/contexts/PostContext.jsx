import { useEffect } from "react";
import { useContext, createContext, useState } from "react";
import { useParams } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getPost } from "../sevices/posts";

const Context = createContext()

export function usePost() {
    return useContext(Context)
}

export function PostProvider({ children }) {
    const { id } = useParams()
    const { loading, error, value: post } = useAsync(() => getPost(id), [id])
    const [comments, setComments] = useState([])  // 建立本地資料, 讓新增修改刪除可以不用在跑一次get 請求
    const rootComments = comments.filter(comment => !comment.parentId)
    const getRepliesByParentId = (parentId) => comments.filter(comment => comment.parentId === parentId)
    const createLocalComment = (comments) => setComments(preComments => [comments, ...preComments])

    // ajax資料回來給本地comments
    useEffect(() => {
        if(!post?.comments) return
        setComments(post.comments)
    }, [post?.comments])


    return <Context.Provider
        value={{
            post: { ...post, id },
            rootComments,
            getRepliesByParentId,
            createLocalComment
        }}>
        {loading
            ? <h1 className="error-msg">Loading</h1>
            : error
                ? <h1>{error}</h1>
                : children
        }
    </Context.Provider>

}