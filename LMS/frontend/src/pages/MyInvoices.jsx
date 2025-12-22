import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { FaArrowLeftLong, FaDownload } from "react-icons/fa6"

function MyInvoices() {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('invoices')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoicesRes, subsRes] = await Promise.all([
          axios.get('/api/invoice/my-invoices', { withCredentials: true }),
          axios.get('/api/invoice/my-subscriptions', { withCredentials: true })
        ])
        setInvoices(invoicesRes.data)
        setSubscriptions(subsRes.data)
      } catch (err) {
        console.error(err)
        toast.error(err.response?.data?.message || "Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate('/')} 
          className="mb-4 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <FaArrowLeftLong /> Back to Home
        </button>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">My Invoices & Subscriptions</h1>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === 'invoices' 
                  ? 'border-b-2 border-purple-600 text-purple-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Invoices ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === 'subscriptions' 
                  ? 'border-b-2 border-purple-600 text-purple-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Subscriptions ({subscriptions.length})
            </button>
          </div>

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              {invoices.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📄</div>
                  <p className="text-xl text-gray-600 font-semibold">No invoices yet</p>
                </div>
              ) : (
                invoices.map((invoice) => (
                  <div 
                    key={invoice._id} 
                    className="bg-gray-50 rounded-lg p-5 flex items-center justify-between hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {invoice.course?.thumbnail && (
                        <img 
                          src={invoice.course.thumbnail} 
                          alt={invoice.course.title}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {invoice.course?.title || 'Course'}
                        </h3>
                        <p className="text-sm text-gray-600">Invoice #{invoice.invoiceNumber}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(invoice.issuedAt).toLocaleDateString()} • {invoice.invoiceType}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">₹{invoice.total}</div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                        invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {invoice.status.toUpperCase()}
                      </span>
                    </div>

                    <button 
                      className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                      onClick={() => toast.info('Download feature coming soon!')}
                    >
                      <FaDownload /> Download
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Subscriptions Tab */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              {subscriptions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎓</div>
                  <p className="text-xl text-gray-600 font-semibold">No active subscriptions</p>
                </div>
              ) : (
                subscriptions.map((sub) => (
                  <div 
                    key={sub._id} 
                    className="bg-gray-50 rounded-lg p-5 flex items-center justify-between hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {sub.course?.thumbnail && (
                        <img 
                          src={sub.course.thumbnail} 
                          alt={sub.course.title}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {sub.course?.title || 'Course'}
                        </h3>
                        <p className="text-sm text-gray-600">Plan: {sub.plan}</p>
                        <p className="text-xs text-gray-500">
                          Started: {new Date(sub.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-800">₹{sub.amount}</div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                        sub.status === 'active' ? 'bg-green-100 text-green-700' :
                        sub.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        sub.status === 'expired' ? 'bg-gray-100 text-gray-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {sub.status.toUpperCase()}
                      </span>
                    </div>

                    <button 
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      onClick={() => navigate(`/viewlecture/${sub.course._id}`)}
                    >
                      Access Course →
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyInvoices
