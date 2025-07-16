import { createFileRoute } from '@tanstack/react-router'
import type { FC } from 'react'
import { IoPersonOutline, IoCalendarOutline, IoTimeOutline, IoSpeedometerOutline, IoCarSportOutline, IoPhonePortraitOutline } from 'react-icons/io5'
import { useData } from '../hooks/useData'

const ProfileComponent: FC = () => {
  const { data } = useData()

  if (!data || !data.userData) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">
            View your user profile information from your Flitsmeister data export.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
          <IoPersonOutline className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Data Available</h3>
          <p className="text-gray-600">Profile information will appear here when available in your data export.</p>
        </div>
      </div>
    )
  }

  const userData = data.userData

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">
          Your Flitsmeister account information and usage statistics.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Driving Statistics Card */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <IoCarSportOutline className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Driving Statistics</h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <IoSpeedometerOutline className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {userData['Top speed'] ? `${userData['Top speed']} km/h` : '--'}
                </div>
                <div className="text-sm text-gray-600">Top Speed</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <IoCarSportOutline className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {userData['Driven distance in kilometers'] ? `${userData['Driven distance in kilometers']} km` : '--'}
                </div>
                <div className="text-sm text-gray-600">Total Distance</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <IoTimeOutline className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {userData['Driven time in seconds'] ? `${Math.round((userData['Driven time in seconds'] as number) / 3600)} hrs` : '--'}
                </div>
                <div className="text-sm text-gray-600">Driving Time</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <IoSpeedometerOutline className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {userData['Top 0-100'] ? `${userData['Top 0-100']}s` : '--'}
                </div>
                <div className="text-sm text-gray-600">Best 0-100</div>
              </div>
            </div>
          </div>
        </div>
        {/* Profile Information Card */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <IoPersonOutline className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">User Information</h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-lg font-semibold text-gray-900">{userData.Name || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Username</label>
                <p className="text-lg font-semibold text-gray-900">{userData.Username || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Birthday</label>
                <p className="text-lg font-semibold text-gray-900">
                  {userData.Birthday ? new Date(userData.Birthday).toLocaleDateString() : 'Not provided'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Country</label>
                <p className="text-lg font-semibold text-gray-900">{String(userData.Country || '') || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Language</label>
                <p className="text-lg font-semibold text-gray-900">{String(userData.Language || '') || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Vehicle Type</label>
                <p className="text-lg font-semibold text-gray-900">{String(userData.Vehicle || '') || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Activity Card */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <IoTimeOutline className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Account Activity</h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <IoCalendarOutline className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {userData.Since ? new Date(userData.Since as string).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '--'}
                </div>
                <div className="text-sm text-gray-600">Member Since</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <IoTimeOutline className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {userData['Last active'] ? new Date(userData['Last active'] as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--'}
                </div>
                <div className="text-sm text-gray-600">Last Active</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <IoPersonOutline className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {userData['Verified email'] === 'Yes' ? 'Verified' : 'Unverified'}
                </div>
                <div className="text-sm text-gray-600">Email Status</div>
              </div>
            </div>
          </div>
        </div>

        {/* App Information Card */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <IoPhonePortraitOutline className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">App Information</h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Platform</label>
                <p className="text-lg font-semibold text-gray-900">{String(userData.Platform || '') || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">App Version</label>
                <p className="text-lg font-semibold text-gray-900">{String(userData['App version'] || '') || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Default Fuel Type</label>
                <p className="text-lg font-semibold text-gray-900">{String(userData['Default fuel type'] || '') || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Apple ID Connected</label>
                <p className="text-lg font-semibold text-gray-900">{userData['Apple ID'] ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/profile')({
  component: ProfileComponent,
}) 