import { useState, useEffect } from 'react'
import axios from 'axios'

export function useApi(endpoint, params = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString()
  const url = `/api/${endpoint}${query ? '?' + query : ''}`

  useEffect(() => {
    setLoading(true)
    setError(null)
    axios.get(url)
      .then(r => { setData(r.data); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [url])

  return { data, loading, error }
}
