import { useState } from 'react';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { AppLayout } from '../../components/app-layout';
import { useRouter } from 'next/router';
import { getAppProps } from '../../utils/getAppProps';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain } from '@fortawesome/free-solid-svg-icons';

export default function NewPost(props) {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [generating, setGenerating] = useState(false);

  const router = useRouter();

  const handleSubmit = async e => {
    e.preventDefault();

    setGenerating(true);
    try {
      const resp = await fetch(`/api/generate-post`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ topic, keywords }),
      });

      const json = await resp.json();

      if (json?.postId) {
        router.push(`/post/${json.postId}`);
      }
    } catch (e) {
      setGenerating(false);
    }
  };

  return (
    <div className='h-full overflow-hidden'>
      {!!generating && (
        <div className='text-green-500 flex h-full animate-pulse w-full flex-col justify-center items-center'>
          <FontAwesomeIcon
            icon={faBrain}
            className='text-8xl'
          />
          <h6>Generating...</h6>
        </div>
      )}
      {!generating && (
        <div className='w-full h-full flex flex-col overflow-auto'>
          <form
            onSubmit={handleSubmit}
            className='m-auto w-full max-w-screen-sm bg-slate-100 p-4 rounded-md shadow-xl border-slate-200 shadow-slate-200'
          >
            <div>
              <label>
                <strong>
                  Generate a blog post on the topic of:
                </strong>
                <textarea
                  className='resize-none border border-slate-500 w-full block my-2 px-4 py-2 rounded-sm'
                  value={topic}
                  maxLength={80}
                  onChange={e => setTopic(e.target.value)}
                />
              </label>
            </div>
            <div>
              <label>
                <strong>
                  Targeting the following keywords:
                </strong>
                <textarea
                  className='resize-none border border-slate-500 w-full block my-2 px-4 py-2 rounded-sm'
                  value={keywords}
                  maxLength={80}
                  onChange={e =>
                    setKeywords(e.target.value)
                  }
                />
                <small className='block mb-2'>
                  Separate keywords with a comma
                </small>
              </label>
            </div>

            <button
              type='submit'
              className='btn'
              disabled={!topic.trim() || !keywords.trim()}
            >
              Generate
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

NewPost.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const props = await getAppProps(ctx);

    if (!props.availableTokens) {
      return {
        redirect: {
          destination: '/token-topup',
          permanent: false,
        },
      };
    }

    return {
      props,
    };
  },
});
