import { post } from '@/types/post'
import Link from 'next/link'
import React from 'react'

interface PostsListProps{
  post:post[]
}
export default function PostList({post}:PostsListProps) {
  
  return (
    <div className="post-list">
        {
          post.map((p)=>(
            <div className="post-item" key={p.id}>
              <h2> <Link href={`posts/${p.id}`}>{p.title}</Link></h2>
            </div>
          ))
        }
      </div>
  )
}
