
import reactLogo from './assets/react.svg'
// import './App.css'
import {
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom'

import PostLists from './components/PostLists'
import { Post } from './components/Post'
import { PostProvider } from './contexts/PostContext'

const router = createBrowserRouter([
  {
    path: "/",
    element: <PostLists />,
  },
  {
    path: "posts/:id",
    element: <PostProvider>
      <Post />
    </PostProvider>
  }
])

function App() {

  return (
    <div className="container">
      <RouterProvider router={router} />
    </div>
  )
}

export default App
