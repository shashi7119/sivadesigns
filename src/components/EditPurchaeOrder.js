import React, { useState, useEffect, useCallback, useMemo} from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Styles.css';
import '../css/DataTable.css';
import axios from 'axios';

const API_URL = 'https://www.wynstarcreations.com/seyal/api';

const EditPurchaseOrder = () => {
  const { id } = useParams(); // purchase order id from route
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [vendors, setVendors] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch vendors, items, and the purchase order to edit
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get(`${API_URL}/getVendors`);
        setVendors(response.data);
      } catch (error) {
        setError('Failed to fetch vendors.');
      }
    };

    const fetchItems = async () => {
      try {
        const response = await axios.get(`${API_URL}/getMasters?type=store`);
        setAvailableItems(response.data);
      } catch (error) {
        setError('Failed to fetch items.');
      }
    };

    const fetchPurchaseOrder = async () => {
      try {
        const response = await axios.get(`${API_URL}/getPurchaseOrder?id=${id}`);
        const po = response.data;
        setSelectedVendorId(po.vendorId);
        setItems(po.items.map(item => ({
          id:item.id,
          itemId: item.itemId,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          tax: parseFloat(item.tax) || 0,
          price: item.price
        })));
      } catch (error) {
        setError('Failed to fetch purchase order.');
      }
    };

    fetchVendors();
    fetchItems();
    fetchPurchaseOrder();
    setLoading(false);
  }, [id]);

  const handleAddItem = useCallback(() => {
    setItems((prevItems) => [
      ...prevItems,
      { id:Date.now(),itemId: '', name: '', quantity: 1, unit: '', tax: 0, price: 0 }
    ]);
  }, []);

  const handleRemoveItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemSelectChange = (id, event) => {
    const selectedItemId = event.target.value;
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
            price: selectedItem ? selectedItem[2] : 0,
            unit: selectedItem ? selectedItem[3] : "",
          }
        : item
    );
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
const total = useMemo(() => {
    console.log('Calculating total...'); // Debug log to see when calculation happens
    return items.reduce(
      (total, item) => 
        total + ((item.quantity * item.price) * ((100 + (item.tax)) / 100)), 
      0
    );
  }, [items]); // Only recalculate when items change

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
      totalAmount: total,
    };
    try {
      const response = await axios.post(
        `${API_URL}/updatePO?id=${id}`,
        purchaseOrderData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (response.data.status === 'success') {
        alert('Purchase Order Updated!');
        navigate('/polist'); // or wherever your list page is
      } else {
        alert('Error updating order.');
      }
    } catch (error) {
      alert('Error updating order.');
      console.error(error);
    }
  };

  if (!isAuthenticated) return null;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="main-content">
      <Container fluid className="relative">
        <Row className="mb-6">
          <div className="col-10 col-sm-10">
            <h1 className="text-2xl font-bold text-gray-800">Edit Purchase Order</h1>
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
                  onChange={e => setSelectedVendorId(e.target.value)}
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
                  type="button"
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
                          Rs.{((item.quantity * item.price) * ((100 + (item.tax)) / 100))}
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            variant="danger"
                            onClick={() => handleRemoveItem(item.id)}
                            className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                            type="button"
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
                  Total: Rs.{total.toFixed(2)}
                </div>
                <Button
                  variant="success"
                  type="submit"
                  disabled={!selectedVendorId || items.length === 0}
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Update Order
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </Container>
    </div>
  );
};

export default EditPurchaseOrder;