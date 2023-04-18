import React, { useCallback, useState } from 'react';

const PostsContext = React.createContext({});

export default PostsContext;

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);

  const setPostsFromSSR = useCallback(
    (postsFromSSR = []) => {
      setPosts(postsFromSSR);
    },
    []
  );

  return (
    <PostsContext.Provider
      value={{
        posts,
        setPostsFromSSR,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};
