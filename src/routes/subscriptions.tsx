import { createFileRoute } from '@tanstack/react-router'
import type { FC } from 'react'
import { IoCloudUploadOutline, IoCardOutline, IoCheckmarkCircleOutline } from 'react-icons/io5'
import { useData } from '../hooks/useData'
import type { ProductData, PaymentData } from '../types/dataTypes'

const SubscriptionsComponent: FC = () => {
  const { data } = useData()

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscriptions</h1>
          <p className="text-gray-600">
            View your Flitsmeister subscription details and service information.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
          <IoCloudUploadOutline className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Subscription Data Available</h3>
          <p className="text-gray-600">Subscription information will appear here when available in your data export.</p>
        </div>
      </div>
    )
  }

  const products = data.products || []
  const payments = data.payments || []

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscriptions</h1>
        <p className="text-gray-600">
          Your Flitsmeister subscription details and billing history.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Active Products */}
        {products.length > 0 && (
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <IoCheckmarkCircleOutline className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Active Subscriptions</h2>
              </div>
            </div>
            
            <div className="p-6">
              {products.map((product: ProductData, index: number) => (
                <div key={index} className="border rounded-lg p-4 mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      {product.plus && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">Plus</span>
                      )}
                      {product.trial && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">Trial</span>
                      )}
                      <span className={`px-2 py-1 text-sm rounded-full ${
                        product.autoRenew 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.autoRenew ? 'Auto-Renew' : 'Manual'}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-gray-500">Platform</label>
                      <p className="text-gray-900">{product.platform}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-500">Started</label>
                      <p className="text-gray-900">
                        {new Date(product.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-500">Expires</label>
                      <p className="text-gray-900">
                        {new Date(product.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment History */}
        {payments.length > 0 && (
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <IoCardOutline className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {payments.slice(0, 10).map((payment: PaymentData, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <IoCardOutline className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{payment.description}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(payment.created_at).toLocaleDateString()} • {payment.deviceType}
                          {payment.trial && <span className="ml-2 text-yellow-600">Trial</span>}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">€{payment.amount}</p>
                      <p className="text-sm text-gray-600">{payment.orderId.slice(0, 8)}...</p>
                    </div>
                  </div>
                ))}
                {payments.length > 10 && (
                  <p className="text-sm text-gray-500 text-center mt-4">
                    Showing 10 of {payments.length} payments
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No data message */}
        {products.length === 0 && payments.length === 0 && (
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <IoCloudUploadOutline className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Subscription Status</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center py-8">
                <IoCloudUploadOutline className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Subscription Data</h3>
                <p className="text-gray-600 mb-4">
                  No subscription or payment information found in your data export.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/subscriptions')({
  component: SubscriptionsComponent,
}) 