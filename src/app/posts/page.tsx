import React from 'react'
import {getAllPost} from'@/lib/api'
import PostList from '@/components/PostList'

async function page() {
  const post = await getAllPost()
  return (
    <>
        <div className="main-heading">
          <h1>PostList</h1>
          <p className="subtitle"> Lorem ipsum dolor, sit amet consectetur adipisicing elit. Tempora exercitationem optio ea est nobis libero, voluptatem sunt adipisci perspiciatis at</p>
        </div>
          <PostList post={post}/>
        </>
  )
}

export default page
