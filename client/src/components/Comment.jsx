import { useState } from 'react'
import { FaEdit, FaHeart, FaRegHeart, FaReply, FaTrash } from 'react-icons/fa'
import { IconBtn } from './IconBtn'
import { CommentList } from './CommentList'
import { CommentForm } from './CommentForm'
import { usePost } from '../contexts/PostContext'
import { useAsyncFn } from '../hooks/useAsync'
import { useUser } from '../hooks/useUser'
import { createComment, deleteComment, updateComment, toggleLikeComment } from '../sevices/comments'

export function Comment({ id, message, user, createdAt, likedByMe, likedCount }) {
    const {
        post,
        getRepliesByParentId,
        createLocalComment, updateLocalComment, deleteLocalComment, ToggleLikeLocalComment
    } = usePost()
    const [areChildrenHidden, setAreChildrenHidden] = useState(false)
    const [isReplying, setIsReplying] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const childComments = getRepliesByParentId(id)

    const createCommentFn = useAsyncFn(createComment)
    const updateCommentFn = useAsyncFn(updateComment)
    const deleteCommentFn = useAsyncFn(deleteComment)
    const toggleLikeCommentFn = useAsyncFn(toggleLikeComment)
    const currentUser = useUser()

    function onCommentReply(message) {
        return createCommentFn.execute({ postId: post.id, message, parentId: id }).then(comment => {
            setIsReplying(false)
            createLocalComment(comment)
        })
    }

    function onCommentUpdate(message) {
        return updateCommentFn.execute({ postId: post.id, message, id }).then(comment => {
            setIsEditing(false)
            updateLocalComment(id, comment.message)
        })
    }

    function onCommentDelete() {
        return deleteCommentFn.execute({ postId: post.id, id }).then(comment => {
            deleteLocalComment(comment.id)
        })
    }

    function onCommentToggleLike() {
        return toggleLikeCommentFn.execute({ postId: post.id, id }).then(comment => {
            ToggleLikeLocalComment(id, comment.isLike)
        })
    }

    // console.log({ childComments })
    return (
        <>
            {/* ??????????????????????????? */}
            <div className="comment">
                <div className="header">
                    <span className="name">
                        {user.name}
                    </span>
                    <span className="date">
                        {dateFormatter(createdAt)}
                    </span>
                </div>

                {isEditing
                    ? <CommentForm
                        autoFocus
                        initialValue={message}
                        onSubmit={onCommentUpdate}
                        loading={updateCommentFn.loading}
                        error={updateCommentFn.error}
                    />
                    : (<div className="message">{message}</div>)
                }

                <div className="footer">
                    <IconBtn
                        disabled={toggleLikeCommentFn.loading}
                        Icon={likedByMe ? FaHeart : FaRegHeart}
                        aria-label={likedByMe ? "??????" : "?????????"}
                        onClick={onCommentToggleLike}
                    >
                        <span>
                            {likedCount}
                        </span>
                    </IconBtn>
                    <IconBtn
                        Icon={FaReply}
                        isActive={isReplying}
                        onClick={() => setIsReplying(preValue => !preValue)}
                        aria-label={isReplying ? "????????????" : "??????"}
                    />
                    {user.id === currentUser.id && (
                        <>
                            <IconBtn
                                Icon={FaEdit}
                                isActive={isEditing}
                                onClick={() => setIsEditing(preValue => !preValue)}
                                aria-label={isEditing ? "????????????" : "??????"}
                            />
                            <IconBtn
                                Icon={FaTrash}
                                color="danger"
                                onClick={onCommentDelete}
                                disabled={deleteCommentFn.loading}
                                aria-label="??????"
                            />
                        </>
                    )}
                </div>
                {/* ????????????????????? */}
                {deleteCommentFn.error && (
                    <div className="error-msg mt-1">
                        {deleteCommentFn.error}
                    </div>)
                }
            </div>
            {/* ???????????? */}
            {isReplying && (
                <div className="mt-1 ml-3">
                    <CommentForm
                        autoFocus
                        loading={createCommentFn.loading}
                        error={createCommentFn.error}
                        onSubmit={onCommentReply}
                    />
                </div>
            )}
            {/* ????????? */}
            {childComments?.length > 0 && (
                <>
                    <div className={`nested-comments-stack ${areChildrenHidden ? "hide" : ""}`}>
                        {/* ????????? */}
                        <button
                            className="collapse-line"
                            aria-label="????????????"
                            onClick={() => setAreChildrenHidden(true)}
                        />
                        <div className="nested-comments">
                            {/* ??????????????????childComments???????????? */}
                            <CommentList comments={childComments} />
                        </div>
                    </div>
                    <button
                        className={`btn mt-1 ${areChildrenHidden ? "" : "hide"}`}
                        aria-label="????????????"
                        onClick={() => setAreChildrenHidden(false)}
                    >
                        ????????????
                    </button>
                </>
            )}
        </>
    )
}


function dateFormatter(date) {
    // undefined =>  the default locale, and the default time zone??????????????????????????? 
    return Intl.DateTimeFormat(undefined, {
        dateStyle: "short",
        timeStyle: "short"
    }).format(Date.parse(date))
    // Date ??? parse() ???????????????????????????????????????????????????
    // ????????????????????? 1970-01-01 00:00:00 UTC (????????????????????????) ????????????????????????????????? (milliseconds)???
}