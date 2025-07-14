import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Styles.css';
import axios from 'axios';

const API_URL = 'https://www.wynstarcreations.com/seyal/api';

const PrintPurchaseOrder = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      try {
        const response = await axios.get(`${API_URL}/getPurchaseOrder?id=${id}`);
        setOrder(response.data);
      } catch (error) {
        setError('Failed to fetch purchase order.');
      } finally {
        setLoading(false);
      }
    };
    fetchPurchaseOrder();
  }, [id]);

  // Print handler
  const handlePrint = () => {
    console.log(user);
    window.print();
  };

  if (!isAuthenticated) return null;
  if (loading) return <div>Loading...</div>;
  if (error || !order) return <div>Error: {error || 'Order not found'}</div>;

  return (
    <div ref={printRef} className="main-content print:bg-white print:p-0">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded shadow print:shadow-none print:border-none">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Purchase Order</h1>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 print:hidden"
          >
            Print
          </button>
        </div>
        <div className="mb-4">
          <div className="text-gray-700"><strong>Order ID:</strong> {order.id}</div>
          <div className="text-gray-700"><strong>Vendor:</strong> {order.vendorId}</div>
          <div className="text-gray-700"><strong>Date:</strong> {order.created_at || order.updated_at}</div>
        </div>
        <table className="min-w-full divide-y divide-gray-200 border mt-6">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border">Item</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border">Quantity</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border">Unit</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border">Price</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border">Tax</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {order.items && order.items.map((item, idx) => (
              <tr key={idx}>
                <td className="px-4 py-2 border">{item.name || item.itemId}</td>
                <td className="px-4 py-2 border">{item.quantity}</td>
                <td className="px-4 py-2 border">{item.unit}</td>
                <td className="px-4 py-2 border">Rs.{item.price}</td>
                <td className="px-4 py-2 border">{item.tax}%</td>
                <td className="px-4 py-2 border">
                  Rs.{((item.quantity * item.price) * ((100 + (item.tax)) / 100)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-6 text-right text-lg font-bold text-gray-900">
          Total: Rs.{order.total_amount || order.items.reduce((total, item) => total + ((item.quantity * item.price) * ((100 + (item.tax)) / 100)), 0).toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default PrintPurchaseOrder;