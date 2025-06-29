'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

const UpdatePrompt = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const promptId = searchParams.get('id');
  
  const { data: session } = useSession();
  
  const [submitting, setSubmitting] = useState(false);
  const [post, setPost] = useState({
    prompt: '',
    tag: '',
    title: ''
  });

  useEffect(() => {
    const getPromptDetails = async () => {
      if (promptId) {
        try {
          const response = await fetch(`/api/prompt/${promptId}`);
          const data = await response.json();
          
          if (data.success) {
            setPost({
              prompt: data.prompt.content,
              tag: data.prompt.tags.join(', '),
              title: data.prompt.title
            });
          }
        } catch (error) {
          console.error('Error fetching prompt:', error);
        }
      }
    };

    getPromptDetails();
  }, [promptId]);

  const updatePrompt = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!promptId) {
      alert('Missing Prompt ID');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/prompt/${promptId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: post.title,
          content: post.prompt,
          tags: post.tag.split(',').map(tag => tag.trim()).filter(tag => tag),
          category: 'general' // Default category
        }),
      });

      if (response.ok) {
        router.push('/');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to update prompt'}`);
      }
    } catch (error) {
      console.error('Error updating prompt:', error);
      alert('Error updating prompt');
    } finally {
      setSubmitting(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="w-full max-w-full flex-start flex-col">
        <h1 className="head_text text-left">
          <span className="blue_gradient">Edit Prompt</span>
        </h1>
        <p className="desc text-left max-w-md">
          Please sign in to edit prompts.
        </p>
      </div>
    );
  }

  return (
    <section className="w-full max-w-full flex-start flex-col">
      <h1 className="head_text text-left">
        <span className="blue_gradient">Edit Prompt</span>
      </h1>
      <p className="desc text-left max-w-md">
        Edit and share amazing prompts with the world, and let your
        imagination run wild with any AI-powered platform.
      </p>

      <form
        onSubmit={updatePrompt}
        className="mt-10 w-full max-w-2xl flex flex-col gap-7 glassmorphism"
      >
        <label>
          <span className="font-satoshi font-semibold text-base text-gray-700">
            Your AI Prompt Title
          </span>

          <input
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
            placeholder="Write your prompt title here"
            required
            className="form_input"
          />
        </label>

        <label>
          <span className="font-satoshi font-semibold text-base text-gray-700">
            Your AI Prompt
          </span>

          <textarea
            value={post.prompt}
            onChange={(e) => setPost({ ...post, prompt: e.target.value })}
            placeholder="Write your prompt here"
            required
            className="form_textarea"
          />
        </label>

        <label>
          <span className="font-satoshi font-semibold text-base text-gray-700">
            Field of Prompt{" "}
            <span className="font-normal">
              (#product, #webdevelopment, #idea, etc.)
            </span>
          </span>
          <input
            value={post.tag}
            onChange={(e) => setPost({ ...post, tag: e.target.value })}
            type="text"
            placeholder="#Tag"
            required
            className="form_input"
          />
        </label>

        <div className="flex-end mx-3 mb-5 gap-4">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="text-gray-500 text-sm"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-1.5 text-sm bg-primary-orange rounded-full text-white"
          >
            {submitting ? 'Updating...' : 'Update'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default UpdatePrompt;
