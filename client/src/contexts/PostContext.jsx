import { useContext, createContext } from "react";
import { useParams } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getPost } from "../sevices/posts";

const Context = createContext()

export function usePost() {
    return useContext(Context)
}

export function PostProvider({ children }) {
    const { id } = useParams()
    const { loading, error, value } = useAsync(() => getPost(id), [id])
    const rootComments = value?.comments.filter(comment => !comment.parentId)
    return <Context.Provider
            value={{
                post: { ...value, id },
                rootComments,
            }}>
        {loading
            ? <h1>Loading</h1>
            : error
                ? <h1>{error}</h1>
                : children
        }
    </Context.Provider>

}