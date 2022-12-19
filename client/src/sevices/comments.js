import makeRequest from "./makeRequest";

export function createComment({ postId, message, parentId }) {
    return makeRequest(`posts/${postId}/comments`, {
        method: "post",
        data: { message, parentId }
    })
}