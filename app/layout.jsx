import './globals.css'
import Nav from '@/components/Nav'
import Provider from '@/components/Provider'

export const metadata = {
  title: 'PromptX',
  description: 'Discover & Share AI Prompts',
}

// Force all pages to be dynamic
export const dynamic = 'force-dynamic'
export const revalidate = 0

const RootLayout = ({ children }) => (
  <html lang='en'>
    <body>
      <Provider>
        <div className='main'>
          <div className='gradient' />
        </div>

        <main className='app'>
          <Nav />
          {children}
        </main>
      </Provider>
    </body>
  </html>
)

export default RootLayout
