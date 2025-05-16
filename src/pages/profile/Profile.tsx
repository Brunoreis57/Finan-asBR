import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Lock } from 'lucide-react';

function Profile() {
  const { user, updateProfile, logout } = useAuth();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile({ name, email });
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditingProfile(false);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setProfileMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      setProfileMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update profile' 
      });
    }
  };
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      return setPasswordMessage({ type: 'error', text: 'Passwords do not match' });
    }
    
    // In a real app, this would call an API
    setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
    setIsChangingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setPasswordMessage({ type: '', text: '' });
    }, 3000);
  };

  return (
    <div className="max-w-3xl mx-auto pb-16 md:pb-0">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account information
        </p>
      </header>
      
      {/* Profile Information */}
      <div className="card mb-8">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center">
            <User className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
            <h2 className="font-semibold text-gray-800 dark:text-gray-200">
              Personal Information
            </h2>
          </div>
          
          {!isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="btn btn-outline py-1 px-3 text-sm"
            >
              Edit
            </button>
          )}
        </div>
        
        <div className="p-6">
          {profileMessage.text && (
            <div className={`mb-4 p-3 rounded-md ${
              profileMessage.type === 'success' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            }`}>
              {profileMessage.text}
            </div>
          )}
          
          {isEditingProfile ? (
            <form onSubmit={handleUpdateProfile}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setName(user?.name || '');
                    setEmail(user?.email || '');
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Full Name
                </div>
                <div className="mt-1 text-gray-800 dark:text-gray-200">
                  {user?.name}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email
                </div>
                <div className="mt-1 text-gray-800 dark:text-gray-200">
                  {user?.email}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Security */}
      <div className="card mb-8">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center">
            <Lock className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
            <h2 className="font-semibold text-gray-800 dark:text-gray-200">
              Security
            </h2>
          </div>
          
          {!isChangingPassword && (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="btn btn-outline py-1 px-3 text-sm"
            >
              Change Password
            </button>
          )}
        </div>
        
        <div className="p-6">
          {passwordMessage.text && (
            <div className={`mb-4 p-3 rounded-md ${
              passwordMessage.type === 'success' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            }`}>
              {passwordMessage.text}
            </div>
          )}
          
          {isChangingPassword ? (
            <form onSubmit={handleChangePassword}>
              <div className="mb-4">
                <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="input"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="input"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="input"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Update Password
                </button>
              </div>
            </form>
          ) : (
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              <p>
                Set a strong password to secure your account. 
                We recommend using a mix of letters, numbers, and special characters.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Account Actions */}
      <div className="card">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200">
            Account Actions
          </h2>
        </div>
        
        <div className="p-6">
          <button
            onClick={logout}
            className="btn btn-danger"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;