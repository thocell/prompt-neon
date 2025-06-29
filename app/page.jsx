export const dynamic = 'force-dynamic'

const Home = () => {
  return (
    <section className='w-full flex-center flex-col'>
      <h1 className='head_text text-center'>
        Discover & Share
        <br className='max-md:hidden' />
        <span className='orange_gradient text-center'> AI-Powered Prompts</span>
      </h1>
      <p className='desc text-center'>
        PromptX is an open-source AI prompting tool for modern world to
        discover, create and share creative prompts
      </p>

      <div className='mt-10'>
        <p className='text-center text-gray-600'>
          🚀 Platform is loading... Authentication and database features coming soon!
        </p>
      </div>
    </section>
  )
}

export default Home
