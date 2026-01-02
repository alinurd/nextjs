import { getLastPost } from "@/lib/api";
import Link from "next/link";
import PostList from '@/components/PostList'

export default async function Home() {
  const post=await getLastPost()
  return (
   <>
    <div className="main-heading">
      <h1>Welcome ALI</h1>
      <p className="subtitle"> Lorem ipsum dolor, sit amet consectetur adipisicing elit. Tempora exercitationem optio ea est nobis libero, voluptatem sunt adipisci perspiciatis at</p>
    </div>
      <PostList post={post}/>
    </>
  );
}
