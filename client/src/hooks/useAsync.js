import { useCallback, useEffect, useState } from "react";

export function useAsync(func, dependencies = []) {
    const { execute, ...state } = useAsyncInternal(func, dependencies, true)
    useEffect(() => {
        execute()
    }, [execute])
    return state
}

export function useAsyncFn(func, dependencies = []) {
    return useAsyncInternal(func, dependencies, false)
}

function useAsyncInternal(func, dependencies, initialLoading = false) {

    const [loading, setLoading] = useState(initialLoading)
    const [error, setError] = useState()
    const [value, setValue] = useState()

    // 執行api的方法
    const execute = useCallback(() => {
        setLoading(true)
        return func()
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