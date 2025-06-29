'use client'

import { useState, useEffect } from 'react'
import PromptCard from './PromptCard'
import Loader from './Loader'

const Feed = () => {
  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)
  const [category, setCategory] = useState('all')

  const fetchPrompts = async (search = '', cat = 'all') => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (cat !== 'all') params.append('category', cat)
      
      const response = await fetch(`/api/prompt?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setPrompts(data.prompts)
      }
    } catch (error) {
      console.error('Error fetching prompts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrompts()
  }, [])

  const handleSearchChange = (e) => {
    clearTimeout(searchTimeout)
    setSearchText(e.target.value)

    setSearchTimeout(
      setTimeout(() => {
        fetchPrompts(e.target.value, category)
      }, 500)
    )
  }

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory)
    fetchPrompts(searchText, newCategory)
  }

  if (loading) {
    return <Loader />
  }

  return (
    <section className="feed">
      <div className="search-section mb-8">
        <input
          type="text"
          placeholder="Search for prompts..."
          value={searchText}
          onChange={handleSearchChange}
          className="search_input peer"
        />
        
        <div className="category-filter mt-4">
          <select 
            value={category} 
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="category_select"
          >
            <option value="all">All Categories</option>
            <option value="technical">Technical</option>
            <option value="creative">Creative</option>
            <option value="business">Business</option>
            <option value="educational">Educational</option>
            <option value="professional">Professional</option>
            <option value="entertainment">Entertainment</option>
          </select>
        </div>
      </div>

      <div className="prompt_layout">
        {prompts.length > 0 ? (
          prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              post={prompt}
              handleTagClick={() => {}}
            />
          ))
        ) : (
          <p className="text-center text-gray-500">No prompts found</p>
        )}
      </div>
    </section>
  )
}

export default Feed
