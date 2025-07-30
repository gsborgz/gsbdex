import { useEffect, useRef } from 'react';

interface InfiniteScrollProps {
  onLoadMore: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  children: React.ReactNode;
}

export default function InfiniteScroll(opts: InfiniteScrollProps) {
  const { 
    onLoadMore, 
    hasNextPage, 
    isFetchingNextPage, 
    children 
  } = opts;
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  return (
    <>
      {children}
      <div ref={loadMoreRef} className='h-10' />
    </>
  );
};
