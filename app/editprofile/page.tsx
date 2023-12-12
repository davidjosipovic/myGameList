'use client'
import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import { UploadButton } from "@/src/utils/uploadthing";
import Image from 'next/image';

const EditProfilePage: React.FC = () => {
  const [userName, setUserName] = useState<string>('');
  const [userPassword, setUserPassword] = useState<string>('');
  const [userInfo, setUserInfo] = useState<string>('');
  const { data: session, update } = useSession();
  const [userNameError, setUserNameError] = useState<string>(''); // Added userNameError state
  const [pictureUrl,setPictureUrl] = useState("")


  useEffect(() => {
    // Fetch user data from the API when the component mounts
    if (session) {
      fetchUserProfile(session.user.name);
    }
  }, [session]);

  const fetchUserProfile = async (username: string) => {
    try {
      const response = await fetch(`/api/user/${encodeURIComponent(username)}`);
      if (response.ok) {
        const userData = await response.json();
        // Fill the state variables with data from the API response
        setUserName(userData.name);
        setUserInfo(userData.info);
        setPictureUrl(userData.picture)
        // You can choose whether or not to fill the password field from the API
        // setUserPassword(userData.password);
      } else {
        console.error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      // If userName is empty or contains only whitespace, set an error message
      setUserNameError('Username cannot be empty');
      return;
    }

    try {
      const response = await fetch(`/api/editprofile/${encodeURIComponent(session.user.name)}`, {
        method: 'PUT',
        body: JSON.stringify({ name: userName, password: userPassword, info: userInfo , picture:pictureUrl }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        // Profile updated successfully
        setUserNameError(''); // Clear the error message
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="p-6 mt-24 max-w-2xl mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-3xl font-semibold">Edit Profile</h1>
      <form onSubmit={handleFormSubmit} className="mt-4">
        <div className="mb-4">
          <label className="block text-gray-600">Name</label>
          <input
            type="text"
            className={`w-full p-2 border rounded ${userNameError ? 'border-red-500' : ''}`}
            value={userName}
            onChange={(e) => {
              setUserName(e.target.value);
              setUserNameError(''); // Clear the error message when the input changes
            }}
          />
          {userNameError && (
            <p className="text-red-500 text-sm mt-1">{userNameError}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-600">Password</label>
          <input
            type="password"
            className="w-full p-2 border rounded"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-600">Info</label>
          <textarea
            className="w-full p-2 border rounded"
            rows={4}
            value={userInfo}
            onChange={(e) => setUserInfo(e.target.value)}
          />
        </div>
        <Image width={500}
        height={500} className="w-32 h-32 rounded-full" src={pictureUrl} alt={`${userName} profile`} />
        <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // Do something with the response
          setPictureUrl(res[0].url)
          console.log("Files: ", res);
          alert("Upload Completed");
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          alert(`ERROR! ${error.message}`);
        }}
        
      />

        <button
          type="submit"
          className={`bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 ${!userName.trim() ? 'cursor-not-allowed' : ''}`}
          disabled={!userName.trim()} // Disable the button if userName is empty
          onClick={() =>
            update({
              ...session,
              user: {
                ...session?.user,
                name: userName,
              },
            })
          }
        >
          Save Profile
        </button>
      </form>
      
    </div>
  );
};

export default EditProfilePage;

