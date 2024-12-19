import { useState, useEffect } from 'react';

export default function useUrlParameters() {
  const [urlParameters, setUrlParameters] = useState({
    pathname: '',
    search: '',
    searchParams: undefined as URLSearchParams | undefined
  });

  useEffect(() => {
    const updateUrlParameters = () => {
      setUrlParameters({
        pathname: window.location.pathname,
        search: window.location.search,
        searchParams: new URLSearchParams(window.location.search)
      });
    };

    // Initialize on mount
    updateUrlParameters();

    // Listen for popstate events (including our manually dispatched ones)
    window.addEventListener('popstate', updateUrlParameters);

    // Listen for pushstate and replacestate events
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (data: any, unused: string, url?: string | URL | null | undefined) {
      originalPushState.apply(this, [data, unused, url]);
      updateUrlParameters();
    };

    window.history.replaceState = function (data: any, unused: string, url?: string | URL | null | undefined) {
      originalReplaceState.apply(this, [data, unused, url]);
      updateUrlParameters();
    };

    return () => {
      window.removeEventListener('popstate', updateUrlParameters);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  return urlParameters;
}
