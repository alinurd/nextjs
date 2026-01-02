import { post } from "@/types/post";
export async function getLastPost():Promise<post[]>{
  const res= await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
  const post = await res.json()
  return post
 }
export async function getPostDetail(id:number):Promise<post>{
  const res= await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  const post = await res.json()
  return post
 }
 
 export async function getAllPost():Promise<post[]>{
  const res= await fetch("https://jsonplaceholder.typicode.com/posts");
  const post = await res.json()
  return post
 }