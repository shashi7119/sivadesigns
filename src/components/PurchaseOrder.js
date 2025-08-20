import React, { useState, useEffect ,useCallback} from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import {  useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Styles.css';
import '../css/DataTable.css';
import axios from 'axios';

const API_URL = 'https://www.wynstarcreations.com/seyal/api';

const PurchaseOrder = () => {
    const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [items, setItems] = useState([{ id: Date.now(),itemId: '', name: '', quantity: 1,unit: '',tax: 5, price: 0 }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const { user , isAuthenticated } = useAuth();

     const handleAddItem = useCallback(() => {
    setItems((prevItems) => [
      ...prevItems,
      { id:Date.now(),itemId: '', quantity: 1, unit: "", tax: 0, price: 0 }
    ]);
  }, []);

  // Shortcut: Ctrl+Enter to trigger Add Item
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        handleAddItem();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAddItem]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get(`${API_URL}/getVendors`);    // Replace with your actual API endpoint
        setVendors(response.data);
       
      } catch (error) {
        setError('Failed to fetch vendors.');
        console.error('Error fetching vendors:', error);
      }
    };

    const fetchItems = async () => {
      try {
        const response = await axios.get(`${API_URL}/getMasters?type=store`);   // Replace with your actual API endpoint
        setAvailableItems(response.data);
      } catch (error) {
        setError('Failed to fetch items.');
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
    fetchItems();
  }, [user]); // Empty dependency array means this runs once after the initial render
  if (!isAuthenticated) {
        return null;
      // navigate('/login');  // Avoid rendering profile if the user is not authenticated
     }
  const handleVendorChange = (event) => {
     
    setSelectedVendorId(event.target.value);
    console.log(selectedVendorId);
  };


  const handleRemoveItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemSelectChange = (id, event) => {
    const selectedItemId = event.target.value;
     // Prevent duplicate selection
  if (items.some(item => item.itemId === selectedItemId && item.itemId !== id)) {
    alert('This item is already selected in another row.');
    return;
  }
    const selectedItem = availableItems.find((item) => item[0] === selectedItemId);
   
    const updatedItems = items.map((item) =>
      item.id === id
        ? {
            ...item,
            itemId: selectedItem ? selectedItem[0] : '',
            name: selectedItem ? selectedItem[1] : '',
            price: selectedItem ? selectedItem[2] : 0, // Assuming your item object has 'defaultPrice'
            unit: selectedItem ? selectedItem[3] : "",
          }
        : item
    );
     console.log(selectedItemId);
    setItems(updatedItems);
  };

  const handleQuantityChange = (id, event) => {
    const { value } = event.target;
    const updatedItems = items.map((item) =>
      item.itemId === id ? { ...item, quantity: parseInt(value) || 1 } : item
    );
    setItems(updatedItems);
  };

  const handlePriceChange = (id, event) => {
    const { value } = event.target;
    const updatedItems = items.map((item) =>
      item.itemId === id ? { ...item, price: parseFloat(value) || 0 } : item
    );
    setItems(updatedItems);
  };
  
   const handleTaxChange = (id, event) => {
    const { value } = event.target;
    const updatedItems = items.map((item) =>
      item.itemId === id ? { ...item, tax: parseFloat(value) || 0 } : item
    );
    setItems(updatedItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + ((item.quantity * item.price)*((100+(item.tax))/100)), 0);
  };

  const handleSubmit = async (event) => {
  event.preventDefault();
  const purchaseOrderData = {
    vendorId: selectedVendorId,
    items: items.map((item) => ({
      itemId: item.itemId,
      quantity: item.quantity,
      tax: item.tax,
      price: item.price,unit: item.unit
    })),
    totalAmount: calculateTotal(),
  };
 console.log(purchaseOrderData);
  try {
    const response = await axios.post(
       `${API_URL}/createPO`,
      purchaseOrderData,
      { headers: { 'Content-Type': 'application/json' } }
    );
    if (response.data.status === 'success') {
      navigate('/polist'); 
      alert('Purchase Order Submitted!');
    } else {
      alert('Error submitting order.');
    }
  } catch (error) {
    alert('Error submitting order.');
    console.error(error);
  }
};

 
  if (loading) {
    return <div>Loading vendors and items...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="main-content" >
      <Container fluid className="relative">
        <Row className="mb-6">
          <div className="col-10 col-sm-10">
            <h1 className="text-2xl font-bold text-gray-800">Purchase Order</h1>
            <p className="text-gray-600">Welcome, {user.email}!</p>
          </div>
        </Row>


        <div className="overflow-hidden rounded-lg border border-gray-200 relative bg-white p-6">
          <Form onSubmit={handleSubmit} className="space-y-6">
            <Form.Group as={Row} className="mb-4">
              <Form.Label column sm="2" className="text-sm font-medium text-gray-700">
                Select Vendor
              </Form.Label>
              <Col sm="6">
                <Form.Select
                  value={selectedVendorId}
                  onChange={handleVendorChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor} value={vendor[0]}>{vendor[1]}</option>
                  ))}
                </Form.Select>
              </Col>
            </Form.Group>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
                <Button 
                  variant="primary" 
                  onClick={handleAddItem}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Add Item
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4">
                          <Form.Select
                            value={item.itemId}
                            onChange={(event) => handleItemSelectChange(item.id, event)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="">Select an item</option>
                            {availableItems.map((availableItem) => (
                              <option key={availableItem[0]} value={availableItem[0]} 
                              disabled={
        // Disable if this item is already selected in another row
        items.some(
          (i) => i.itemId === availableItem[0] && i.itemId !== item.itemId
        )
      }>
                                {availableItem[1]}
                              </option>
                            ))}
                          </Form.Select>
                        </td>
                        <td className="px-6 py-4">
                          <Form.Control
                            type="number"
                            value={item.quantity}
                            onChange={(event) => handleQuantityChange(item.itemId, event)}
                            min="1"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Form.Control
                            type="text"
                            value={item.unit}
                            readOnly
                            className="block w-full rounded-md border-gray-300 bg-gray-50"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Form.Control
                            type="number"
                            value={item.price}
                            onChange={(event) => handlePriceChange(item.itemId, event)}
                            min="0"
                            step="0.01"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Form.Control
                            type="number"
                            value={item.tax}
                            onChange={(event) => handleTaxChange(item.itemId, event)}
                            min="0"
                            step="0.01"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 font-medium">
                          Rs.{((item.quantity * item.price)*((100+(item.tax))/100)).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <Button 
                            variant="danger" 
                            onClick={() => handleRemoveItem(item.id)}
                            className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <div className="text-lg font-bold text-gray-900">
                  Total: Rs.{calculateTotal().toFixed(2)}
                </div>
                <Button 
                  variant="success" 
                  type="submit" 
                  disabled={!selectedVendorId || items.length === 0}
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Submit Order
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </Container>
    </div>
  );
};

export default PurchaseOrder;