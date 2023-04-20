import React, { useCallback, useState } from 'react';

const PostsContext = React.createContext({});

export default PostsContext;

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [noMorePosts, setNoMorePosts] = useState(false);

  const setPostsFromSSR = useCallback(
    (postsFromSSR = []) => {
      setPosts(value => {
        const newPosts = [...value];
        postsFromSSR.forEach(post => {
          const exists = newPosts.find(
            p => p._id === post._id
          );
          if (!exists) {
            newPosts.push(post);
          }
        });
        return newPosts;
      });
    },
    []
  );

  const getPosts = useCallback(
    async ({ lastPostDate, getNewerPosts = false }) => {
      const result = await fetch(`/api/get-posts`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ lastPostDate, getNewerPosts }),
      });
      const json = await result.json();
      const postResults = json.posts || [];

      if (postResults.length < 5) {
        setNoMorePosts(true);
      }

      // setPosts(prev => [...prev, ...postResults]);

      setPosts(value => {
        const newPosts = [...value];
        postResults.forEach(post => {
          const exists = newPosts.find(
            p => p._id === post._id
          );
          if (!exists) {
            newPosts.push(post);
          }
        });
        return newPosts;
      });
    },
    []
  );

  return (
    <PostsContext.Provider
      value={{
        posts,
        setPostsFromSSR,
        getPosts,
        noMorePosts,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};
