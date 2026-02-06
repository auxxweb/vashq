import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { BookOpen, GraduationCap, MessageSquare, Plus, Edit, Trash2, Search, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

export default function SuperAdminSupport() {
  const [activeTab, setActiveTab] = useState('help')
  const [helpArticles, setHelpArticles] = useState([])
  const [tutorials, setTutorials] = useState([])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Help Articles
  const [helpDialogOpen, setHelpDialogOpen] = useState(false)
  const [editingHelp, setEditingHelp] = useState(null)
  const [helpForm, setHelpForm] = useState({ title: '', content: '', category: '', isPublished: true })

  // Tutorials
  const [tutorialDialogOpen, setTutorialDialogOpen] = useState(false)
  const [editingTutorial, setEditingTutorial] = useState(null)
  const [tutorialForm, setTutorialForm] = useState({ title: '', description: '', youtubeLink: '', steps: [], isPublished: true })

  // Tickets
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'help') {
        const res = await api.get('/super-admin/support/help-articles')
        setHelpArticles(res.data.articles || [])
      } else if (activeTab === 'tutorials') {
        const res = await api.get('/super-admin/support/tutorials')
        setTutorials(res.data.tutorials || [])
      } else if (activeTab === 'tickets') {
        const res = await api.get('/super-admin/support/tickets')
        setTickets(res.data.tickets || [])
      }
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveHelp = async () => {
    try {
      if (editingHelp) {
        await api.put(`/super-admin/support/help-articles/${editingHelp._id}`, helpForm)
        toast.success('Help article updated')
      } else {
        await api.post('/super-admin/support/help-articles', helpForm)
        toast.success('Help article created')
      }
      setHelpDialogOpen(false)
      setEditingHelp(null)
      setHelpForm({ title: '', content: '', category: '', isPublished: true })
      fetchData()
    } catch (error) {
      toast.error('Failed to save help article')
    }
  }

  const handleDeleteHelp = async (id) => {
    if (!confirm('Delete this help article?')) return
    try {
      await api.delete(`/super-admin/support/help-articles/${id}`)
      toast.success('Help article deleted')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const handleSaveTutorial = async () => {
    try {
      if (editingTutorial) {
        await api.put(`/super-admin/support/tutorials/${editingTutorial._id}`, tutorialForm)
        toast.success('Tutorial updated')
      } else {
        await api.post('/super-admin/support/tutorials', tutorialForm)
        toast.success('Tutorial created')
      }
      setTutorialDialogOpen(false)
      setEditingTutorial(null)
      setTutorialForm({ title: '', description: '', youtubeLink: '', steps: [], isPublished: true })
      fetchData()
    } catch (error) {
      toast.error('Failed to save tutorial')
    }
  }

  const handleDeleteTutorial = async (id) => {
    if (!confirm('Delete this tutorial?')) return
    try {
      await api.delete(`/super-admin/support/tutorials/${id}`)
      toast.success('Tutorial deleted')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const handleReplyTicket = async () => {
    if (!replyText.trim()) return
    try {
      await api.post(`/super-admin/support/tickets/${selectedTicket._id}/reply`, { message: replyText })
      toast.success('Reply sent')
      setReplyText('')
      setTicketDialogOpen(false)
      fetchData()
    } catch (error) {
      toast.error('Failed to send reply')
    }
  }

  const handleUpdateTicketStatus = async (ticketId, status) => {
    try {
      await api.patch(`/super-admin/support/tickets/${ticketId}/status`, { status })
      toast.success('Ticket status updated')
      fetchData()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      OPEN: 'default',
      IN_PROGRESS: 'secondary',
      RESOLVED: 'success',
      CLOSED: 'outline'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getPriorityBadge = (priority) => {
    const colors = {
      LOW: 'bg-gray-500',
      MEDIUM: 'bg-blue-500',
      HIGH: 'bg-orange-500',
      URGENT: 'bg-red-500'
    }
    return <Badge className={colors[priority] || 'bg-gray-500'}>{priority}</Badge>
  }

  const filteredHelp = helpArticles.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredTutorials = tutorials.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredTickets = tickets.filter(t =>
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>
          <p className="text-muted-foreground">Manage help articles, tutorials, and support tickets</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="help">
            <BookOpen className="h-4 w-4 mr-2" />
            Help Articles
          </TabsTrigger>
          <TabsTrigger value="tutorials">
            <GraduationCap className="h-4 w-4 mr-2" />
            Tutorials
          </TabsTrigger>
          <TabsTrigger value="tickets">
            <MessageSquare className="h-4 w-4 mr-2" />
            Support Tickets
          </TabsTrigger>
        </TabsList>

        {/* Help Articles Tab */}
        <TabsContent value="help" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingHelp(null); setHelpForm({ title: '', content: '', category: '', isPublished: true }) }}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Article
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingHelp ? 'Edit' : 'Create'} Help Article</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={helpForm.title}
                      onChange={(e) => setHelpForm({ ...helpForm, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input
                      value={helpForm.category}
                      onChange={(e) => setHelpForm({ ...helpForm, category: e.target.value })}
                      placeholder="e.g., Getting Started, Billing, etc."
                    />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={helpForm.content}
                      onChange={(e) => setHelpForm({ ...helpForm, content: e.target.value })}
                      rows={10}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="helpPublished"
                      checked={helpForm.isPublished}
                      onChange={(e) => setHelpForm({ ...helpForm, isPublished: e.target.checked })}
                    />
                    <Label htmlFor="helpPublished">Published</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setHelpDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveHelp}>Save</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredHelp.map((article) => (
              <Card key={article._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingHelp(article)
                          setHelpForm(article)
                          setHelpDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteHelp(article._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{article.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">{article.content}</p>
                  <Badge variant={article.isPublished ? 'default' : 'secondary'} className="mt-2">
                    {article.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tutorials Tab */}
        <TabsContent value="tutorials" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={tutorialDialogOpen} onOpenChange={setTutorialDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingTutorial(null); setTutorialForm({ title: '', description: '', youtubeLink: '', steps: [], isPublished: true }) }}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Tutorial
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingTutorial ? 'Edit' : 'Create'} Tutorial</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={tutorialForm.title}
                      onChange={(e) => setTutorialForm({ ...tutorialForm, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={tutorialForm.description}
                      onChange={(e) => setTutorialForm({ ...tutorialForm, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>YouTube Link</Label>
                    <Input
                      value={tutorialForm.youtubeLink}
                      onChange={(e) => setTutorialForm({ ...tutorialForm, youtubeLink: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="tutorialPublished"
                      checked={tutorialForm.isPublished}
                      onChange={(e) => setTutorialForm({ ...tutorialForm, isPublished: e.target.checked })}
                    />
                    <Label htmlFor="tutorialPublished">Published</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setTutorialDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveTutorial}>Save</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTutorials.map((tutorial) => (
              <Card key={tutorial._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingTutorial(tutorial)
                          setTutorialForm(tutorial)
                          setTutorialDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTutorial(tutorial._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">{tutorial.description}</p>
                  {tutorial.youtubeLink && (
                    <div className="mt-2">
                      <a href={tutorial.youtubeLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        Watch Video →
                      </a>
                    </div>
                  )}
                  <Badge variant={tutorial.isPublished ? 'default' : 'secondary'} className="mt-2">
                    {tutorial.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="tickets" className="space-y-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <Card key={ticket._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                      </div>
                      <CardDescription>
                        From: {ticket.businessId?.businessName || 'Unknown Business'} • {new Date(ticket.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={ticket.status}
                        onValueChange={(value) => handleUpdateTicketStatus(ticket._id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OPEN">OPEN</SelectItem>
                          <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                          <SelectItem value="RESOLVED">RESOLVED</SelectItem>
                          <SelectItem value="CLOSED">CLOSED</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTicket(ticket)
                          setTicketDialogOpen(true)
                        }}
                      >
                        View & Reply
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{ticket.description}</p>
                  {ticket.replies && ticket.replies.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Replies ({ticket.replies.length})</p>
                      {ticket.replies.map((reply, idx) => (
                        <div key={idx} className="bg-muted/80 p-3 rounded-lg">
                          <p className="text-sm">{reply.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(reply.repliedAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedTicket?.subject}</DialogTitle>
              </DialogHeader>
              {selectedTicket && (
                <div className="space-y-4">
                  <div>
                    <Label>Description</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedTicket.description}</p>
                  </div>
                  {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                    <div>
                      <Label>Replies</Label>
                      <div className="space-y-2 mt-2">
                        {selectedTicket.replies.map((reply, idx) => (
                          <div key={idx} className="bg-muted/80 p-3 rounded-lg">
                            <p className="text-sm">{reply.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(reply.repliedAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <Label>Your Reply</Label>
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={4}
                      placeholder="Type your reply here..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setTicketDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleReplyTicket}>Send Reply</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  )
}
