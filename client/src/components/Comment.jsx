import { useState } from 'react'
import { FaEdit, FaHeart, FaReply, FaTrash } from 'react-icons/fa'
import { IconBtn } from './IconBtn'
import { CommentList } from './CommentList'
import { CommentForm } from './CommentForm'
import { usePost } from '../contexts/PostContext'
import { useAsyncFn } from '../hooks/useAsync'
import { useUser } from '../hooks/useUser'
import { createComment, deleteComment, updateComment } from '../sevices/comments'

export function Comment({ id, message, user, createdAt }) {
    const {
        post,
        getRepliesByParentId,
        createLocalComment, updateLocalComment, deleteLoaclComment
    } = usePost()
    const [areChildrenHidden, setAreChildrenHidden] = useState(false)
    const [isReplying, setIsReplying] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const childComments = getRepliesByParentId(id)

    const createCommentFn = useAsyncFn(createComment)
    const updateCommentFn = useAsyncFn(updateComment)
    const deleteCommentFn = useAsyncFn(deleteComment)
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
            deleteLoaclComment(comment.id)
        })
    }

    // console.log({ childComments })
    return (
        <>
            {/* 第一次近來是根評論 */}
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
                    <IconBtn Icon={FaHeart} aria-label="喜歡">
                        2
                    </IconBtn>
                    <IconBtn
                        Icon={FaReply}
                        isActive={isReplying}
                        onClick={() => setIsReplying(preValue => !preValue)}
                        aria-label={isReplying ? "取消回覆" : "回覆"}
                    />
                    {user.id === currentUser.id && (
                        <>
                            <IconBtn
                                Icon={FaEdit}
                                isActive={isEditing}
                                onClick={() => setIsEditing(preValue => !preValue)}
                                aria-label={isEditing ? "取消編輯" : "編輯"}
                            />
                            <IconBtn
                                Icon={FaTrash}
                                color="danger"
                                onClick={onCommentDelete}
                                disabled={deleteCommentFn.loading}
                                aria-label="刪除"
                            />
                        </>
                    )}
                </div>
                {/* 刪除錯誤的訊息 */}
                {deleteCommentFn.error && (
                    <div className="error-msg mt-1">
                        {deleteCommentFn.error}
                    </div>)
                }
            </div>
            {/* 回覆區塊 */}
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
            {/* 子評論 */}
            {childComments?.length > 0 && (
                <>
                    <div className={`nested-comments-stack ${areChildrenHidden ? "hide" : ""}`}>
                        {/* 垂直線 */}
                        <button
                            className="collapse-line"
                            aria-label="隱藏回覆"
                            onClick={() => setAreChildrenHidden(true)}
                        />
                        <div className="nested-comments">
                            {/* 類似遞迴直到childComments沒有資料 */}
                            <CommentList comments={childComments} />
                        </div>
                    </div>
                    <button
                        className={`btn mt-1 ${areChildrenHidden ? "" : "hide"}`}
                        aria-label="顯示回覆"
                        onClick={() => setAreChildrenHidden(false)}
                    >
                        顯示回覆
                    </button>
                </>
            )}
        </>
    )
}


function dateFormatter(date) {
    // undefined =>  the default locale, and the default time zone根據當前的運行環境 
    return Intl.DateTimeFormat(undefined, {
        dateStyle: "short",
        timeStyle: "short"
    }).format(Date.parse(date))
    // Date 的 parse() 方法用來將日期時間字串轉成一個數字
    // ，這數字表示從 1970-01-01 00:00:00 UTC (格林威治標準時間) 開始累計到現在的毫秒數 (milliseconds)。
}