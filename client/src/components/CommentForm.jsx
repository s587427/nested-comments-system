import { useState } from "react"

// autoFocus react內置的property可以自動focus在輸入框(蠻重要的~)

export function CommentForm({ initialValue = "", loading, error, onSubmit, autoFocus = false }) {
    // initialValue(可能來自新建的或編輯訊息)
    const [message, setMessage] = useState(initialValue)

    function handleSubmit(e) {
        e.preventDefault()
        // 善用了form的reuse, 傳入crud的function或額外...
        onSubmit(message).then(() => setMessage(""))
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="comment-form-row">
                <textarea
                    value={message}
                    className="message-input"
                    onChange={e => setMessage(e.target.value)}
                    autoFocus={autoFocus}
                />
                <button className="btn" type="submit" disabled={loading}>
                    {loading ? "Loading" : "發表留言"}
                </button>
            </div>
            <div className="error-msg">
                {error}
            </div>
        </form>
    )
}

