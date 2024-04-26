'use client'
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UploadButton } from '@/src/utils/uploadthing';
import ProfilePicture from '@/components/ProfilePicture';

const EditProfilePage: React.FC = () => {
  const [userName, setUserName] = useState<string>('');
  const [userPassword, setUserPassword] = useState<string>('');
  const [userInfo, setUserInfo] = useState<string>('');
  const { data: session, update } = useSession();
  const [userNameError, setUserNameError] = useState<string>('');
  const [pictureUrl, setPictureUrl] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const extractFileKey = (url) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  useEffect(() => {
    const fetchUserProfile = async (username: string) => {
      try {
        const response = await fetch(`/api/user/${username}`);
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
  }, [session]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName.trim()) {
      setUserNameError('Username cannot be empty');
      return;
    }

    try {
      const response = await fetch(`/api/editprofile/${session.user.name}`, {
        method: 'PUT',
        body: JSON.stringify({ name: userName, password: userPassword, info: userInfo, picture: pictureUrl }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setUserNameError('');
        setSuccessMessage('Profile updated successfully.');
       
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
      const deleteResponse = await fetch(`/api/deletepicture/${fileKey}`, {
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
      const response = await fetch(`/api/editprofile/${session.user.name}`, {
        method: 'PUT',
        body: JSON.stringify({ picture: res[0].url }),
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
    <div className=" mt-20 px-4 sm:w-4/5 lg:container lg:mx-auto  lg:px-48 xl:px-72    ">
      <h1 className="lg:text-3xl font-bold mb-8 text-2xl  lg:text-center  text-white">Edit Profile</h1>
      <form onSubmit={handleFormSubmit} className="mt-4">

        {/* Image and UploadButton */}
        <div className='flex gap-6'>
          <div className='hidden sm:inline'><ProfilePicture size="big" /></div>
          <div className=' sm:hidden'><ProfilePicture size="medium" /></div>

          <div className='flex w-2/3 flex-col md:gap-6 items-center gap-2 mb-8  '>
            <p className='text-white'>Image must be in jpg file format. File size must be less than 4MB.</p>
            <div className='flex gap-4'>
              <UploadButton
                appearance={{
                  button: "hover:bg-green-dark hover:shadow-xl h-fit w-28 py-2 text-center text-md rounded-lg font-bold bg-green-light shadow-lg  shadow-grey-dark  text-grey-dark",
                  allowedContent: "hidden"
                }}

                endpoint="imageUploader"
                onClientUploadComplete={handlePictureUploadComplete}
                onUploadError={(error: Error) => {
                  // Do something with the error.
                  alert(`ERROR! ${error.message}`);
                }}
              />
              <button
                type="button"
                className=" hover:bg-opacity-50 hover:shadow-xl h-fit w-28 p-2 text-center text-md rounded-lg font-bold bg-red shadow-lg  shadow-grey-dark  text-grey-dark"
                onClick={handleDeletePicture}
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Name input */}
        <div className="mb-4">
          <label htmlFor='Name input' className="block text-white">Name</label>
          <input
            type="text"
            id='Name input'
            className={`w-full px-2 py-1 border text-white bg-grey-dark border-white rounded-xl shadow-xl ${userNameError ? 'border-red-500' : ''}`}
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
          <label htmlFor='Password input' className="block text-white ">Password</label>
          <input
            type="password"
            id='Password input'
            className="w-full px-2 py-1 border text-white bg-grey-dark border-white rounded-xl shadow-xl"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
          />
        </div>

        {/* Biography textarea */}
        <div className="">
          <label className="block text-white" htmlFor="Biography input">Biography</label>
          <textarea
            id='Biography input'
            className="w-full px-2 py-1 border text-white bg-grey-dark border-white rounded-xl shadow-xl"
            rows={4}
            value={userInfo?userInfo:""}
            onChange={(e) => setUserInfo(e.target.value)}
          />
        </div>



        {/* Save button */}
        <button
          type="submit"
          className={`my-12 hover:bg-green-dark w-full bg-green-light hover:shadow-xl p-2 text-center text-lg rounded-lg font-bold shadow-lg  shadow-grey-dark  text-grey-dark ${!userName.trim() ? 'cursor-not-allowed' : ''}`}
          disabled={!userName.trim()} // Disable the button if userName is empty
          onClick={() =>{update({
              ...session,
              user: {
                ...session?.user,
                name: userName,
              },
            })
            setSuccessMessage("")
          }
            
          }
        >
          Save Profile
        </button>
        {successMessage && <p className="text-white mb-12 text-center">{successMessage}</p>}
      </form>
    </div>
  );
};

export default EditProfilePage;
