import {getPostDetail} from '@/lib/api'
interface pageProps{
  params:{
    id:number
  }
}
async function page({params}:pageProps) {
  const d= await getPostDetail(await params.id)
  console.log( )
    return (
    <div className='post-detail'>
      <h1>Post Detail</h1>
      <h2>{d.title}</h2>
      <div className="content">{d.body}</div>
    </div>
  )
}

export default page
