import { useCallback, useEffect, useState } from "react";


// func 接收一個promise func
// 根據依賴直接執行promise的fun
// 回傳all state
export function useAsync(func, dependencies = []) {
    const { execute, ...state } = useAsyncInternal(func, dependencies, true)
    useEffect(() => {
        execute()
    }, [execute])
    return state
}

// func 接收一個promise func
// retrun all state以及執行promise的func
export function useAsyncFn(func, dependencies = []) {
    return useAsyncInternal(func, dependencies, false)
}

function useAsyncInternal(func, dependencies, initialLoading = false) {

    const [loading, setLoading] = useState(initialLoading)
    const [error, setError] = useState()
    const [value, setValue] = useState()

    // 執行api的方法
    const execute = useCallback((params) => {
        setLoading(true)
        return func(params)
            .then(data => {
                setValue(data)
                setError(undefined)
                return data
            })
            .catch(error => {
                setValue(undefined)
                setError(error)
                return Promise.reject(error)
            })
            .finally(() => {
                setLoading(false)
            })

    }, dependencies)

    return { loading, error, value, execute }
}