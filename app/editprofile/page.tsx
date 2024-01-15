'use client'
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UploadButton } from '@/src/utils/uploadthing';
import Image from 'next/image';

const EditProfilePage: React.FC = () => {
  const [userName, setUserName] = useState<string>('');
  const [userPassword, setUserPassword] = useState<string>('');
  const [userInfo, setUserInfo] = useState<string>('');
  const { data: session, update } = useSession();
  const [userNameError, setUserNameError] = useState<string>('');
  const [pictureUrl, setPictureUrl] = useState<string>('');

  const extractFileKey = (url) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  useEffect(() => {
    const fetchUserProfile = async (username: string) => {
      try {
        const response = await fetch(`/api/user/${encodeURIComponent(username)}`);
        if (response.ok) {
          const userData = await response.json();
          setUserName(userData.name);
          setUserInfo(userData.info);
          setPictureUrl(userData.picture);
        } else {
          console.error('Failed to fetch user profile');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    if (session && !userName) {
      fetchUserProfile(session.user.name);
    }
  }, [session, userName]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName.trim()) {
      setUserNameError('Username cannot be empty');
      return;
    }

    try {
      const response = await fetch(`/api/editprofile/${encodeURIComponent(session.user.name)}`, {
        method: 'PUT',
        body: JSON.stringify({ name: userName, password: userPassword, info: userInfo, picture: pictureUrl }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setUserNameError('');
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleDeletePicture = async () => {
    try {
      const fileKey = extractFileKey(pictureUrl);
      console.log(fileKey)
      const deleteResponse = await fetch(`/api/deletepicture/${encodeURIComponent(fileKey)}`, {
        method: 'GET',
      });

      if (deleteResponse.ok) {
        setPictureUrl('/Default_pfp.png'); // Clear pictureUrl after deletion
        console.log('Picture deleted successfully');
      } else {
        console.error('Failed to delete picture');
      }
    } catch (error) {
      console.error('Error deleting picture:', error);
    }

    
  };
  const handlePictureUploadComplete = async (res) => {
    // Do something with the response
    setPictureUrl(res[0].url);
    console.log('Files: ', res);
    alert('Upload Completed');
  

    try {
      const response = await fetch(`/api/editprofile/${encodeURIComponent(session.user.name)}`, {
        method: 'PUT',
        body: JSON.stringify({  picture: res[0].url  }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('It works ');
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
        {/* Name input */}
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

        {/* Password input */}
        <div className="mb-4">
          <label className="block text-gray-600">Password</label>
          <input
            type="password"
            className="w-full p-2 border rounded"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
          />
        </div>

        {/* Info textarea */}
        <div className="mb-4">
          <label className="block text-gray-600">Info</label>
          <textarea
            className="w-full p-2 border rounded"
            rows={4}
            value={userInfo}
            onChange={(e) => setUserInfo(e.target.value)}
          />
        </div>

        {/* Image and UploadButton */}
        <div className='flex gap-6'>
          <Image width={500} height={500} className="w-32 h-32 rounded-full" src={pictureUrl} alt={`${userName} profile`} />
          <div className='flex flex-col md:flex-row md:gap-6 '>
             <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={handlePictureUploadComplete}
            onUploadError={(error: Error) => {
              // Do something with the error.
              alert(`ERROR! ${error.message}`);
            }}
          />
          <button
          type="button"
          className="relative mt-8 flex h-10 w-36 cursor-pointer items-center justify-center overflow-hidden rounded-md text-white after:transition-[width] after:duration-500 focus-within:ring-2 focus-within:ring-red-600 focus-within:ring-offset-2 bg-red-600"
          onClick={handleDeletePicture}
        >
          Delete Picture
        </button></div>
         
        </div>

        {/* Save button */}
        <button
          type="submit"
          className={`bg-blue-500 text-white py-2 mt-8 px-4 rounded hover:bg-blue-600 ${!userName.trim() ? 'cursor-not-allowed' : ''}`}
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
