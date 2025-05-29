import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Pencil, ThumbsDown, ThumbsUp } from 'lucide-react'

export default function Home() {
    const [user, setUser] = useState(null)
    const [posts, setPosts] = useState([])
    const [sortOption, setSortOption] = useState('all')
    const token = Cookies.get('token')
    const navigate = useNavigate()
    const [postTitle, setPostTitle] = useState('')
    const [postContent, setPostContent] = useState('')
    const [postLoading, setPostLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [postId, setPostId] = useState(null)
    const [updatePostTitle, setUpdatePostTitle] = useState('')
    const [updatePostContent, setUpdatePostContent] = useState('')

    const getUser = async () => {
        const resp = await fetch('http://localhost:3000/auth/current-user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        const data = await resp.json()
        setUser(data)
    }

    const getPosts = async (sort = 'all') => {
        const resp = await fetch(`http://localhost:3000/posts?sort=${sort}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        const data = await resp.json()
        setPosts(data)
    }

    useEffect(() => {
        if (!token) {
            navigate('/sign-in')
        } else {
            getUser()
            getPosts(sortOption)
        }
    }, [sortOption]) 

    const handleLogOut = () => {
        Cookies.remove('token')
        navigate('sign-in')
    }

    const handleCreatePost = async (e) => {
        e.preventDefault()
        setPostLoading(true)
        const resp = await fetch('http://localhost:3000/posts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                title: postTitle,
                content: postContent
            })
        })
        const data = await resp.json()
        if (resp.status === 201) {
            toast.success('post created successfully')
            await getPosts(sortOption)
            setPostLoading(false)
            setPostContent('')
            setPostTitle('')
        } else {
            toast.error(data.message)
        }
    }

    const handleDeletePost = async (id) => {
        const resp = await fetch(`http://localhost:3000/posts/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-type': 'application/json'
            },
        })
        const data = await resp.json()
        if (resp.status === 200) {
            toast.success('deleted successfully')
            await getPosts(sortOption)
        } else {
            toast.error(data.message)
        }
    }

    const handleUpdate = async (id) => {
        setShowModal(prev => !prev)
        setPostId(id)
        await getPostById(id)
    }

    const getPostById = async (id) => {
        const resp = await fetch(`http://localhost:3000/posts/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        const data = await resp.json()

        setUpdatePostTitle(data?.title)
        setUpdatePostContent(data?.content)
    }

    const handleUpdateForm = async (e) => {
        e.preventDefault()

        const resp = await fetch(`http://localhost:3000/posts/${postId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                title: updatePostTitle,
                content: updatePostContent
            })
        })
        const data = await resp.json()
        if (resp.status === 200) {
            toast.success('updated successfully')
            setShowModal(false)
            setUpdatePostContent('')
            setUpdatePostTitle('')
            await getPosts(sortOption)
        } else {
            toast.error(data.message)
        }
    }

    const handleReaction = async (type, id) => {
        const resp = await fetch(`http://localhost:3000/posts/${id}/reactions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                type: type
            })
        })
        if (resp.status === 200) {
            await getPosts(sortOption)
        }
    }

    return (
        <div>
            {showModal && <div onClick={() => {
                setShowModal(false)
                setPostId(null)
            }} className='fixed w-full flex justify-center items-center h-screen p-4 bg-black/30'>
                <form onSubmit={handleUpdateForm} onClick={(e) => e.stopPropagation()} className='p-4 bg-white flex flex-col gap-4 '>
                    <input
                        type="text"
                        className='border-2 '
                        value={updatePostTitle}
                        onChange={(e) => setUpdatePostTitle(e.target.value)}
                    />
                    <input
                        type="text"
                        className='border-2 '
                        value={updatePostContent}
                        onChange={(e) => setUpdatePostContent(e.target.value)}
                    />
                    <button>Update</button>
                </form>
            </div>}
            
            <div className='w-full flex flex-col items-end p-2'>
                <div className='flex flex-col items-center'>
                    <Link to={'profile'} className='flex flex-col justify-center items-center'>
                        <img
                            src={user?.avatar || '/vite.svg'}
                            alt='user'
                            className='rounded-full'
                            width={40}
                            height={40}
                        />
                        <h2>{user?.email}</h2>
                    </Link>
                    <button onClick={handleLogOut} className='p-2 bg-red-500 rounded-2xl cursor-pointer'>Log out</button>
                </div>
            </div>

            <form onSubmit={handleCreatePost} className='w-[300px] mx-auto flex flex-col gap-2'>
                <input
                    type="text"
                    placeholder='post title'
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    required
                    className='border-2 border-black'
                />
                <input
                    type="text"
                    placeholder='post content'
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    required
                    className='border-2 border-black'
                />
                <button className='p-2 bg-blue-500'>{postLoading ? 'Loading...' : 'Create new Post'}</button>
            </form>

            <div className='w-[300px] mx-auto mt-4'>
                <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className='border-2 p-2 w-full'
                >
                    <option value="all">all posts</option>
                    <option value="mostLiked">with most likes</option>
                    <option value="leastLiked">with least likes</option>
                </select>
            </div>

            <div className='border-2 mt-4 p-2 border-black grid grid-cols-3 gap-2'>
                {posts.map(el => (
                    <div key={el._id} className='border-2 border-black p-2 rounded-sm'>
                        <h1>{el.title}</h1>
                        <h1>{el.content}</h1>

                        <p>{el.author.fullName}</p>
                        {
                            user?._id?.toString() === el.author._id.toString() ?
                                <button onClick={() => handleDeletePost(el._id)} className='p-1 bg-red-500'>Delete</button>
                                : null
                        }

                        {
                            user?._id?.toString() === el.author._id.toString() ?
                                <button onClick={() => handleUpdate(el._id)} className=''>
                                    <Pencil />
                                </button>
                                : null
                        }

                        <div className='mt-2'>
                            <button onClick={() => handleReaction('like', el._id)}>
                                <ThumbsUp />
                                {el.reactions?.likes?.length}
                            </button>
                            <button onClick={() => handleReaction('dislike', el._id)}>
                                <ThumbsDown className='stroke-red-500' />
                                {el.reactions?.dislikes?.length}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
