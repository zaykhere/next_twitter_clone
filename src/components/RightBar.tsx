import React from 'react'
import Search from './Search'
import PopularTags from './PopularTags'
import Recommendations from './Recommendations'

const RightBar = () => {
  return (
    <div className="pt-4 flex flex-col gap-4 sticky-top-0 h-max">
      <Search />
      <PopularTags />
      <Recommendations />
      <footer className='text-textGray text-sm flex gap-4 flex-wrap'>
        <span>&copy; 2025 ZTD</span>
      </footer>
    </div>
  )
}

export default RightBar