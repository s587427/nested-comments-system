import { useState } from 'react'
import { FaEdit, FaHeart, FaReply, FaTrash } from 'react-icons/fa'
import { IconBtn } from './IconBtn'
import { usePost } from '../contexts/PostContext'
import { CommentList } from './CommentList'

export function Comment({ id, message, user, createdAt }) {
    const { getRepliesByParentId } = usePost()
    const childComments = getRepliesByParentId(id)
    const [areChildrenHidden, setAreChildrenHidden] = useState(false)
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
                <div className="message">
                    {message}
                </div>
                <div className="footer">
                    <IconBtn Icon={FaHeart} aria-label="喜歡">
                        2
                    </IconBtn>
                    <IconBtn Icon={FaReply} aria-label="回覆" />
                    <IconBtn Icon={FaEdit} aria-label="編輯" />
                    <IconBtn Icon={FaTrash} aria-label="刪除" color="danger" />
                </div>
            </div>
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