import { useState, useEffect } from "react"
import Cookies from 'js-cookie'
import { Link, useNavigate } from "react-router-dom"
import { Pencil } from 'lucide-react'

export default function Profile() {
    const token = Cookies.get('token')
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)


    const [isEditOpen, setIsEditOpen] = useState(false)

    const [editFullName, setEditFullName] = useState('')
    const [editEmail, setEditEmail] = useState('')
    const [updating, setUpdating] = useState(false)

    const getUser = async () => {
        try {
            const resp = await fetch('http://localhost:3000/auth/current-user', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (resp.status === 200) {
                const data = await resp.json()
                setUser(data)
            } else {
                navigate('/sign-in')
            }
        } catch (e) {
            navigate('/sign-in')
        }
    }

    useEffect(() => {
        getUser()
    }, [])

    const handleUploadAvatar = async (e) => {
        setLoading(true)
        const files = e.target.files
        const formData = new FormData()
        formData.append('avatar', files[0])

        const resp = await fetch('http://localhost:3000/users', {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        })
        if (resp.status === 200) {
            await getUser()
        }
        setLoading(false)
    }

    const openEditModal = () => {
        setEditFullName(user.fullName || '')
        setEditEmail(user.email || '')
        setIsEditOpen(true)
    }

    const closeEditModal = () => {
        setIsEditOpen(false)
    }

    const handleUpdateProfile = async () => {
        setUpdating(true)
        const resp = await fetch('http://localhost:3000/users', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fullName: editFullName, email: editEmail })
        })
        if (resp.status === 200) {
            await getUser()
            setIsEditOpen(false)
            alert('Profile updated successfully!')
        } else {
            alert('Failed to update profile.')
        }
        setUpdating(false)
    }

    if (!user) return <div>Loading user data...</div>

    return (
        <div className="p-4 max-w-lg mx-auto">

            <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">
                &larr; Back to home
            </Link>

            <h1 className="text-3xl font-semibold mb-6">Profile</h1>

            <div className="mb-4 flex items-center justify-between">
                <div>
                    <strong>Full Name:</strong> {user.fullName}
                </div>
                <button
                    onClick={openEditModal}
                    aria-label="Edit profile"
                    title="Edit profile"
                    className="text-black-600 hover:text-blue-800"
                >
                     <Pencil />
                </button>
            </div>

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <strong>Email:</strong> {user.email}
                </div>
            </div>

            <div className="mb-6">
                <img
                    src={user.avatar}
                    alt="User avatar"
                    className="w-40 h-40 rounded-full object-cover"
                />
            </div>

            <div className="mb-4">
                <label
                    htmlFor="avatar"
                    className="inline-block cursor-pointer bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
                >
                    {loading ? 'Uploading...' : 'Upload New Avatar'}
                </label>
                <input
                    id="avatar"
                    type="file"
                    onChange={handleUploadAvatar}
                    className="hidden"
                />
            </div>

            {isEditOpen && (
                <div
                    className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
                    onClick={closeEditModal}
                >
                    <div
                        className="bg-white p-6 rounded shadow-lg w-full max-w-md"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>

                        <label className="block mb-2 font-medium" htmlFor="editFullName">Full Name</label>
                        <input
                            id="editFullName"
                            type="text"
                            value={editFullName}
                            onChange={e => setEditFullName(e.target.value)}
                            className="w-full mb-4 p-2 border rounded"
                        />

                        <label className="block mb-2 font-medium" htmlFor="editEmail">Email</label>
                        <input
                            id="editEmail"
                            type="email"
                            value={editEmail}
                            onChange={e => setEditEmail(e.target.value)}
                            className="w-full mb-6 p-2 border rounded"
                        />

                        <div className="flex justify-center">
                            <button
                                onClick={handleUpdateProfile}
                                disabled={updating}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
                            >
                                {updating ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
