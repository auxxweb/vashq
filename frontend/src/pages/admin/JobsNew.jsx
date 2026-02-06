import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { preventEnterSubmit } from '../../lib/formUtils'
import { formatCurrency } from '../../lib/currencyUtils'

export default function JobsNew() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [cars, setCars] = useState([])
  const [services, setServices] = useState([])
  const [currency, setCurrency] = useState('USD')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    customerId: '',
    carId: '',
    serviceIds: [],
    notes: ''
  })
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    whatsappNumber: '',
    email: ''
  })
  const [newCar, setNewCar] = useState({
    carNumber: '',
    brand: '',
    model: '',
    color: ''
  })
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [showNewCar, setShowNewCar] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (formData.customerId) {
      fetchCars(formData.customerId)
    }
  }, [formData.customerId])

  const fetchData = async () => {
    try {
      const [customersRes, servicesRes, settingsRes] = await Promise.all([
        api.get('/admin/customers'),
        api.get('/admin/services'),
        api.get('/admin/settings').catch(() => ({ data: {} }))
      ])
      if (customersRes.data.success) {
        setCustomers(customersRes.data.customers || [])
      }
      if (servicesRes.data.success) {
        setServices((servicesRes.data.services || []).filter(s => s.isActive))
      }
      if (settingsRes?.data?.success && settingsRes.data.settings?.currency) {
        setCurrency(settingsRes.data.settings.currency)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error(error.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const fetchCars = async (customerId) => {
    try {
      const response = await api.get(`/admin/cars?customerId=${customerId}`)
      if (response.data.success) {
        setCars(response.data.cars || [])
      }
    } catch (error) {
      console.error('Failed to load cars:', error)
      toast.error(error.response?.data?.message || 'Failed to load cars')
    }
  }

  const handleCreateCustomer = async () => {
    try {
      const response = await api.post('/admin/customers', newCustomer)
      if (response.data.success) {
        setCustomers([...customers, response.data.customer])
        setFormData({ ...formData, customerId: response.data.customer._id })
        setNewCustomer({ name: '', phone: '', whatsappNumber: '', email: '' })
        setShowNewCustomer(false)
        toast.success('Customer created successfully!')
      } else {
        toast.error('Failed to create customer')
      }
    } catch (error) {
      console.error('Create customer error:', error)
      toast.error(error.response?.data?.message || 'Failed to create customer')
    }
  }

  const handleCreateCar = async () => {
    if (!formData.customerId) {
      toast.error('Please select a customer first')
      return
    }
    try {
      const response = await api.post('/admin/cars', {
        ...newCar,
        customerId: formData.customerId
      })
      if (response.data.success) {
        setCars([...cars, response.data.car])
        setFormData({ ...formData, carId: response.data.car._id })
        setNewCar({ carNumber: '', brand: '', model: '', color: '' })
        setShowNewCar(false)
        toast.success('Car created successfully!')
      } else {
        toast.error('Failed to create car')
      }
    } catch (error) {
      console.error('Create car error:', error)
      toast.error(error.response?.data?.message || 'Failed to create car')
    }
  }

  const handleServiceToggle = (serviceId) => {
    if (formData.serviceIds.includes(serviceId)) {
      setFormData({
        ...formData,
        serviceIds: formData.serviceIds.filter(id => id !== serviceId)
      })
    } else {
      setFormData({
        ...formData,
        serviceIds: [...formData.serviceIds, serviceId]
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.customerId || !formData.carId || formData.serviceIds.length === 0) {
      toast.error('Please fill all required fields')
      return
    }

    setSubmitting(true)
    try {
      const response = await api.post('/admin/jobs', formData)
      if (response.data.success) {
        toast.success('Job created successfully!')
        navigate('/admin/jobs')
      } else {
        toast.error('Failed to create job')
      }
    } catch (error) {
      console.error('Create job error:', error)
      toast.error(error.response?.data?.message || 'Failed to create job')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/jobs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Job</h1>
          <p className="text-muted-foreground">Add a new car wash job</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} onKeyDown={preventEnterSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer & Car</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Customer *</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.customerId}
                  onValueChange={(value) => setFormData({ ...formData, customerId: value, carId: '' })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer._id} value={customer._id}>
                        {customer.name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewCustomer(!showNewCustomer)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {showNewCustomer && (
                <Card className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone *</Label>
                      <Input
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp Number *</Label>
                    <Input
                      value={newCustomer.whatsappNumber}
                      onChange={(e) => setNewCustomer({ ...newCustomer, whatsappNumber: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="button" onClick={handleCreateCustomer}>
                    Create Customer
                  </Button>
                </Card>
              )}
            </div>

            <div className="space-y-2">
              <Label>Car *</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.carId}
                  onValueChange={(value) => setFormData({ ...formData, carId: value })}
                  disabled={!formData.customerId}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select car" />
                  </SelectTrigger>
                  <SelectContent>
                    {cars.map((car) => (
                      <SelectItem key={car._id} value={car._id}>
                        {car.carNumber} {car.brand && car.model && `- ${car.brand} ${car.model}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewCar(!showNewCar)}
                  disabled={!formData.customerId}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {showNewCar && (
                <Card className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Car Number *</Label>
                    <Input
                      value={newCar.carNumber}
                      onChange={(e) => setNewCar({ ...newCar, carNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Brand</Label>
                      <Input
                        value={newCar.brand}
                        onChange={(e) => setNewCar({ ...newCar, brand: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Model</Label>
                      <Input
                        value={newCar.model}
                        onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <Input
                        value={newCar.color}
                        onChange={(e) => setNewCar({ ...newCar, color: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button type="button" onClick={handleCreateCar}>
                    Create Car
                  </Button>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Services *</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {services.map((service) => (
                <div
                  key={service._id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${
                    formData.serviceIds.includes(service._id) ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleServiceToggle(service._id)}
                >
                  <div>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(service.price, currency)} • {service.minTime}-{service.maxTime} min
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.serviceIds.includes(service._id)}
                    onChange={() => handleServiceToggle(service._id)}
                    className="h-4 w-4"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Link to="/admin/jobs">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Job'}
          </Button>
        </div>
      </form>
    </div>
  )
}
