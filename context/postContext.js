import React, { useCallback, useReducer, useState } from 'react';

const PostsContext = React.createContext({});

export default PostsContext;

function postReducer(state, action) {
  switch (action.type) {
    case 'addPosts': {
      const newPosts = [...state];
      action.posts.forEach(post => {
        const exists = newPosts.find(
          p => p._id === post._id
        );
        if (!exists) {
          newPosts.push(post);
        }
      });
      return newPosts;
    }
    case 'deletePost': {
      return (state = state.filter(
        el => el._id !== action.postId
      ));
    }
    default:
      return state;
  }
}

export const PostProvider = ({ children }) => {
  const [posts, dispatch] = useReducer(postReducer, []);
  const [noMorePosts, setNoMorePosts] = useState(false);

  const deletePost = useCallback(postId => {
    dispatch({
      type: 'deletePost',
      postId,
    });
  }, []);

  const setPostsFromSSR = useCallback(
    (postsFromSSR = []) => {
      dispatch({
        type: 'addPosts',
        posts: postsFromSSR,
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
        body: JSON.stringify({
          lastPostDate,
          getNewerPosts,
        }),
      });
      const json = await result.json();
      const postResults = json.posts || [];

      if (postResults.length < 5) {
        setNoMorePosts(true);
      }

      dispatch({
        type: 'addPosts',
        posts: postResults,
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
        deletePost,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};
