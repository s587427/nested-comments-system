import makeRequest from "./makeRequest";

export function createComment({ postId, message, parentId }) {
    return makeRequest(`posts/${postId}/comments`, {
        method: "post",
        data: { message, parentId }
    })
}

export function updateComment({ postId, message, id }) {
    return makeRequest(`posts/${postId}/comments/${id}`, {
        method: "put",
        data: { message }
    })
}

export function deleteComment({ postId, id }) {
    return makeRequest(`posts/${postId}/comments/${id}`, {
        method: "delete",
    })
}