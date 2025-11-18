'use client'
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UploadButton } from '@/src/utils/uploadthing';
import ProfilePicture from '@/components/ProfilePicture';
import {useRouter} from 'next/navigation';

const EditProfilePage: React.FC = () => {
  const [userName, setUserName] = useState<string>('');
  const [userPassword, setUserPassword] = useState<string>('');
  const [userInfo, setUserInfo] = useState<string>('');
  const { data: session, update } = useSession();
  const [userNameError, setUserNameError] = useState<string>('');
  const [pictureUrl, setPictureUrl] = useState<string>('');
  const [oldPictureUrl, setOldPictureUrl] = useState<string>(''); // Track original picture
  const router = useRouter();
  const[isSavingProfile,setIsSavingProfile]=useState(false)

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
          setOldPictureUrl(userData.picture); // Store original picture
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
    setIsSavingProfile(true)
    e.preventDefault();

    if (!userName.trim()) {
      setUserNameError('Username cannot be empty');
      setIsSavingProfile(false);
      return;
    }

    try {
      // Update profile in database (backend will handle old picture deletion)
      const response = await fetch(`/api/editprofile/${session.user.name}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          name: userName, 
          password: userPassword, 
          info: userInfo, 
          picture: pictureUrl,
          oldPicture: oldPictureUrl // Send old picture URL for cleanup
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setUserNameError('');
        setOldPictureUrl(pictureUrl); // Update old picture reference
        
        // Update session with new username
        await update({
          ...session,
          user: {
            ...session?.user,
            name: userName,
          },
        });
        
        router.push(`/profile/${userName}`);
      } else {
        console.error('Failed to update profile');
        setIsSavingProfile(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setIsSavingProfile(false);
    }
  };
  
  const handleDeletePicture = async () => {
    try {
      // Only delete if not already default picture
      if (pictureUrl === '/Default_pfp.png') {
        console.log('Picture is already default, no need to delete');
        return;
      }

      const fileKey = extractFileKey(pictureUrl);
      console.log('Deleting file:', fileKey);
      
      const deleteResponse = await fetch(`/api/deletepicture/${fileKey}`, {
        method: 'DELETE',
      });

      if (deleteResponse.ok) {
        const data = await deleteResponse.json();
        setPictureUrl('/Default_pfp.png');
        setOldPictureUrl('/Default_pfp.png');
        console.log('Picture deleted successfully');
        
        // Update session picture immediately
        await update({
          ...session,
          user: {
            ...session?.user,
            image: '/Default_pfp.png',
          },
        });
      } else {
        console.error('Failed to delete picture');
        alert('Failed to delete picture. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting picture:', error);
      alert('Error deleting picture. Please try again.');
    }
  };
  const handlePictureUploadComplete = async (res) => {
    // Update picture URL in state (will be saved when form is submitted)
    setPictureUrl(res[0].url);
    console.log('Files: ', res);
    alert('Upload Completed! Click "Save Changes" to update your profile.');
  };

  return (
    <div className="min-h-screen bg-grey-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Edit Profile</h1>
          <p className="text-white/70">Update your profile information and preferences</p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Profile Picture Section */}
          <div className='bg-grey-dark border border-white/20 rounded-2xl p-6 shadow-lg'>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-green-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Profile Picture
            </h2>
            <div className='flex flex-col sm:flex-row gap-6 items-center sm:items-start'>
              <div className='w-32 h-32 rounded-full overflow-hidden border-4 border-green-light/30 shadow-xl shadow-green-light/20 flex-shrink-0'>
                <ProfilePicture className="rounded-full" size="big" />
              </div>
              <div className='flex-1 space-y-4'>
                <div className='bg-grey-light/50 border border-white/10 rounded-xl p-4'>
                  <p className='text-white/90 text-sm leading-relaxed'>
                    <span className="font-medium text-green-light">Requirements:</span> Image must be in JPG format. File size must be less than 4MB.
                  </p>
                </div>
                <div className='flex flex-wrap gap-3 items-stretch'>
                  <UploadButton
                    appearance={{
                      button: "ut-ready:bg-green-light ut-uploading:bg-green-dark ut-ready:hover:bg-green-dark px-6 py-3 text-grey-dark font-bold rounded-lg shadow-lg hover:shadow-green-light/30 transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap text-base leading-tight h-[46px] flex items-center",
                      allowedContent: "hidden"
                    }}
                    endpoint="imageUploader"
                    onClientUploadComplete={handlePictureUploadComplete}
                    onUploadError={(error: Error) => {
                      alert(`ERROR! ${error.message}`);
                    }}
                  />
                  <button
                    type="button"
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      fontWeight: 'bold',
                      borderRadius: '0.5rem',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      border: 'none',
                      whiteSpace: 'nowrap',
                      fontSize: '1rem',
                      lineHeight: '1.25',
                      height: '46px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#dc2626';
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(239, 68, 68, 0.3), 0 8px 10px -6px rgba(239, 68, 68, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ef4444';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = 'scale(0.95)';
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    onClick={handleDeletePicture}
                  >
                    Delete Picture
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information Section */}
          <div className='bg-grey-dark border border-white/20 rounded-2xl p-6 shadow-lg'>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-green-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account Information
            </h2>
            <div className="space-y-4">
              {/* Name input */}
              <div>
                <label htmlFor='Name input' className="block text-white font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id='Name input'
                  className={`w-full px-4 py-3 border text-white bg-grey-light border-white/20 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-light focus:border-transparent transition-all duration-200 ${userNameError ? 'border-red-500 focus:ring-red-500' : ''}`}
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                    setUserNameError('');
                  }}
                  placeholder="Enter your username"
                />
                {userNameError && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {userNameError}
                  </p>
                )}
              </div>

              {/* Password input */}
              <div>
                <label htmlFor='Password input' className="block text-white font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id='Password input'
                  className="w-full px-4 py-3 border text-white bg-grey-light border-white/20 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-light focus:border-transparent transition-all duration-200"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="Enter new password (optional)"
                />
              </div>

              {/* Biography textarea */}
              <div>
                <label className="block text-white font-medium mb-2" htmlFor="Biography input">
                  Biography
                </label>
                <textarea
                  id='Biography input'
                  className="w-full px-4 py-3 border text-white bg-grey-light border-white/20 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-light focus:border-transparent transition-all duration-200 resize-none"
                  rows={5}
                  value={userInfo?userInfo:""}
                  onChange={(e) => setUserInfo(e.target.value)}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className={`flex-1 px-6 py-4 bg-green-light hover:bg-green-dark text-grey-dark font-bold rounded-lg hover:shadow-lg hover:shadow-green-light/20 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${!userName.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!userName.trim()}
              onClick={() =>{update({
                  ...session,
                  user: {
                    ...session?.user,
                    name: userName,
                  },
                })
              }}
            >
              {isSavingProfile ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Changes...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/profile/${session?.user?.name}`)}
              className="px-6 py-4 bg-transparent border-2 border-white/20 text-white hover:border-white/40 hover:bg-white/5 font-bold rounded-lg transition-all duration-200 active:scale-95"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
