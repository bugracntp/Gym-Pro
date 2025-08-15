import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiUtils } from '../utils/api';

// API çağrıları için custom hook
export const useApi = (apiFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const abortControllerRef = useRef(null);
  const {
    autoExecute = true,
    immediate = true,
    onSuccess,
    onError,
    retryCount = 3,
    retryDelay = 1000
  } = options;

  // API çağrısını yapan fonksiyon
  const execute = useCallback(async (params = {}) => {
    if (!apiFunction) return;

    // Önceki isteği iptal et
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Yeni abort controller oluştur
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const result = await ApiUtils.retryRequest(
        async () => {
          const response = await apiFunction(params, abortControllerRef.current.signal);
          return response;
        },
        retryCount
      );

      setData(result);
      setIsInitialized(true);
      
      if (onSuccess) {
        onSuccess(result, params);
      }
      
      return result;
    } catch (err) {
      // Abort edilmiş istekler için hata gösterme
      if (err.name === 'AbortError') {
        return;
      }

      const errorMessage = ApiUtils.formatErrorMessage(err);
      setError(errorMessage);
      
      if (onError) {
        onError(err, params);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError, retryCount]);

  // Manuel tetikleme
  const refetch = useCallback((params = {}) => {
    return execute(params);
  }, [execute]);

  // Reset state
  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
    setIsInitialized(false);
  }, []);

  // Auto-execute effect
  useEffect(() => {
    if (autoExecute && immediate && apiFunction) {
      execute();
    }

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, dependencies);

  // Dependencies değiştiğinde yeniden çalıştır
  useEffect(() => {
    if (autoExecute && isInitialized && dependencies.length > 0) {
      execute();
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    isInitialized,
    execute,
    refetch,
    reset,
    setData
  };
};

// Mutasyon (POST, PUT, DELETE) için hook
export const useMutation = (apiFunction, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const {
    onSuccess,
    onError,
    onMutate,
    retryCount = 3
  } = options;

  const mutate = useCallback(async (params = {}) => {
    if (!apiFunction) return;

    setLoading(true);
    setError(null);

    // Optimistic update
    if (onMutate) {
      onMutate(params);
    }

    try {
      const result = await ApiUtils.retryRequest(
        async () => {
          const response = await apiFunction(params);
          return response;
        },
        retryCount
      );

      setData(result);
      
      if (onSuccess) {
        onSuccess(result, params);
      }
      
      return result;
    } catch (err) {
      const errorMessage = ApiUtils.formatErrorMessage(err);
      setError(errorMessage);
      
      if (onError) {
        onError(err, params);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError, onMutate, retryCount]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    mutate,
    reset,
    setData
  };
};

// Infinite scroll için hook
export const useInfiniteQuery = (apiFunction, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  const {
    pageSize = 10,
    onSuccess,
    onError,
    retryCount = 3
  } = options;

  const fetchNextPage = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const result = await ApiUtils.retryRequest(
        async () => {
          const response = await apiFunction({ page, limit: pageSize });
          return response;
        },
        retryCount
      );

      if (result && result.length > 0) {
        setData(prev => [...prev, ...result]);
        setPage(prev => prev + 1);
        setHasMore(result.length === pageSize);
        
        if (onSuccess) {
          onSuccess(result, { page, limit: pageSize });
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      const errorMessage = ApiUtils.formatErrorMessage(err);
      setError(errorMessage);
      
      if (onError) {
        onError(err, { page, limit: pageSize });
      }
    } finally {
      setLoading(false);
    }
  }, [apiFunction, page, pageSize, loading, hasMore, onSuccess, onError, retryCount]);

  const reset = useCallback(() => {
    setData([]);
    setLoading(false);
    setError(null);
    setHasMore(true);
    setPage(1);
  }, []);

  return {
    data,
    loading,
    error,
    hasMore,
    page,
    fetchNextPage,
    reset,
    setData
  };
}; 