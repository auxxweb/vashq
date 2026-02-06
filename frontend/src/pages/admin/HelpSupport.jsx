import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Badge } from '../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { BookOpen, GraduationCap, MessageSquare, Search, Plus, Loader2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { preventEnterSubmit } from '../../lib/formUtils'
import { format } from 'date-fns'

const TICKET_STATUS_COLORS = {
  OPEN: 'bg-sky-50 text-sky-700 border border-sky-100',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border border-amber-100',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  CLOSED: 'bg-slate-100 text-slate-700 border border-slate-200'
}

const PRIORITY_COLORS = {
  LOW: 'bg-gray-500',
  MEDIUM: 'bg-blue-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-500'
}

export default function HelpSupport() {
  const [activeTab, setActiveTab] = useState('help')
  const [helpArticles, setHelpArticles] = useState([])
  const [tutorials, setTutorials] = useState([])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [helpSearch, setHelpSearch] = useState('')
  const [helpCategory, setHelpCategory] = useState('')
  const [tutorialSearch, setTutorialSearch] = useState('')
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [selectedTutorial, setSelectedTutorial] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [newTicketOpen, setNewTicketOpen] = useState(false)
  const [newTicketSubmitting, setNewTicketSubmitting] = useState(false)
  const [newTicketForm, setNewTicketForm] = useState({ subject: '', description: '', priority: 'MEDIUM' })

  const fetchHelp = async () => {
    try {
      const params = new URLSearchParams()
      if (helpSearch.trim()) params.set('search', helpSearch.trim())
      if (helpCategory.trim()) params.set('category', helpCategory.trim())
      const res = await api.get(`/admin/support/help-articles?${params}`)
      setHelpArticles(res.data.articles || [])
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load help articles')
    }
  }

  const fetchTutorials = async () => {
    try {
      const params = new URLSearchParams()
      if (tutorialSearch.trim()) params.set('search', tutorialSearch.trim())
      const res = await api.get(`/admin/support/tutorials?${params}`)
      setTutorials(res.data.tutorials || [])
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load tutorials')
    }
  }

  const fetchTickets = async () => {
    try {
      const res = await api.get('/admin/support/tickets')
      setTickets(res.data.tickets || [])
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load tickets')
    }
  }

  useEffect(() => {
    setLoading(true)
    if (activeTab === 'help') {
      fetchHelp().catch(() => {}).finally(() => setLoading(false))
    } else if (activeTab === 'tutorials') {
      fetchTutorials().catch(() => {}).finally(() => setLoading(false))
    } else if (activeTab === 'tickets') {
      fetchTickets().catch(() => {}).finally(() => setLoading(false))
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'help') {
      const t = setTimeout(() => fetchHelp(), 300)
      return () => clearTimeout(t)
    }
  }, [helpSearch, helpCategory])

  useEffect(() => {
    if (activeTab === 'tutorials') {
      const t = setTimeout(() => fetchTutorials(), 300)
      return () => clearTimeout(t)
    }
  }, [tutorialSearch])

  const handleCreateTicket = async (e) => {
    e?.preventDefault()
    if (!newTicketForm.subject?.trim() || !newTicketForm.description?.trim()) {
      toast.error('Subject and description are required')
      return
    }
    setNewTicketSubmitting(true)
    try {
      await api.post('/admin/support/tickets', newTicketForm)
      toast.success('Support ticket created. We will get back to you soon.')
      setNewTicketOpen(false)
      setNewTicketForm({ subject: '', description: '', priority: 'MEDIUM' })
      fetchTickets()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create ticket')
    } finally {
      setNewTicketSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 min-h-[400px]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground">Search help articles, tutorials, or raise a support ticket</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap w-full sm:w-auto">
          <TabsTrigger value="help">
            <BookOpen className="h-4 w-4 mr-2" />
            Help Center
          </TabsTrigger>
          <TabsTrigger value="tutorials">
            <GraduationCap className="h-4 w-4 mr-2" />
            Tutorials
          </TabsTrigger>
          <TabsTrigger value="tickets">
            <MessageSquare className="h-4 w-4 mr-2" />
            My Tickets
          </TabsTrigger>
        </TabsList>

        {/* Help Center */}
        <TabsContent value="help" className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-1 items-center gap-2 min-w-0">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by keyword..."
                  value={helpSearch}
                  onChange={(e) => setHelpSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="button" variant="secondary" size="icon" className="shrink-0 h-10 w-10" aria-label="Search">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Input
                placeholder="Filter by category"
                value={helpCategory}
                onChange={(e) => setHelpCategory(e.target.value)}
                className="w-full sm:w-48"
              />
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {helpArticles.map((article) => (
                <Card
                  key={article._id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setSelectedArticle(article)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    {article.category && (
                      <CardDescription>{article.category}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">{article.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {!loading && helpArticles.length === 0 && (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No help articles found. Try a different search or ask your admin to add articles in Support.</CardContent></Card>
          )}
        </TabsContent>

        {/* Tutorials */}
        <TabsContent value="tutorials" className="space-y-4">
          <div className="flex flex-1 items-center gap-2 min-w-0 max-w-md">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tutorials..."
                value={tutorialSearch}
                onChange={(e) => setTutorialSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="button" variant="secondary" size="icon" className="shrink-0 h-10 w-10" aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {tutorials.map((tutorial) => (
                <Card
                  key={tutorial._id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setSelectedTutorial(tutorial)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{tutorial.description}</p>
                    {tutorial.youtubeLink && (
                      <span className="inline-flex items-center text-xs text-primary mt-2">
                        <ExternalLink className="h-3 w-3 mr-1" /> Video available
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {!loading && tutorials.length === 0 && (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No tutorials found. Try a different search or ask your admin to add tutorials in Support.</CardContent></Card>
          )}
        </TabsContent>

        {/* My Tickets */}
        <TabsContent value="tickets" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setNewTicketOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <Card
                  key={ticket._id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <CardContent className="py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{ticket.subject}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{ticket.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={TICKET_STATUS_COLORS[ticket.status]}>{ticket.status.replace('_', ' ')}</Badge>
                        <Badge className={PRIORITY_COLORS[ticket.priority]}>{ticket.priority}</Badge>
                        <span className="text-xs text-muted-foreground">{format(new Date(ticket.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {!loading && tickets.length === 0 && (
            <Card><CardContent className="py-12 text-center text-muted-foreground">You have no support tickets yet. Click &quot;New Ticket&quot; to get help.</CardContent></Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Article detail modal */}
      <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedArticle?.title}</DialogTitle>
            {selectedArticle?.category && <CardDescription>{selectedArticle.category}</CardDescription>}
          </DialogHeader>
          {selectedArticle && (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-700">{selectedArticle.content}</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tutorial detail modal */}
      <Dialog open={!!selectedTutorial} onOpenChange={(open) => !open && setSelectedTutorial(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTutorial?.title}</DialogTitle>
          </DialogHeader>
          {selectedTutorial && (
            <div className="space-y-4">
              <p className="text-muted-foreground whitespace-pre-wrap">{selectedTutorial.description}</p>
              {selectedTutorial.youtubeLink && (
                <a
                  href={selectedTutorial.youtubeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4 mr-2" /> Watch video
                </a>
              )}
              {selectedTutorial.steps?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Steps</h4>
                  <ol className="list-decimal list-inside space-y-2">
                    {selectedTutorial.steps.sort((a, b) => (a.order || 0) - (b.order || 0)).map((step, i) => (
                      <li key={i}>
                        <span className="font-medium">{step.title}</span>
                        <p className="text-sm text-muted-foreground ml-6">{step.description}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ticket detail modal */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ticket: {selectedTicket?.subject}</DialogTitle>
            <div className="flex gap-2">
              {selectedTicket && (
                <>
                  <Badge className={TICKET_STATUS_COLORS[selectedTicket.status]}>{selectedTicket.status.replace('_', ' ')}</Badge>
                  <Badge className={PRIORITY_COLORS[selectedTicket.priority]}>{selectedTicket.priority}</Badge>
                  <span className="text-sm text-muted-foreground">{format(new Date(selectedTicket.createdAt), 'PPp')}</span>
                </>
              )}
            </div>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>
              {selectedTicket.replies?.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Replies</Label>
                  <div className="mt-2 space-y-3 border-l-2 border-muted pl-4">
                    {selectedTicket.replies.map((reply, i) => (
                      <div key={i} className="text-sm">
                        <p className="whitespace-pre-wrap">{reply.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {reply.repliedBy?.email ?? 'Support'} · {reply.repliedAt ? format(new Date(reply.repliedAt), 'PPp') : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New ticket dialog */}
      <Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raise Support Ticket</DialogTitle>
            <DialogDescription>Describe your issue. Our team will respond as soon as possible.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTicket} onKeyDown={preventEnterSubmit} className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={newTicketForm.subject}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                placeholder="Brief summary of your issue"
                required
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newTicketForm.priority}
                onValueChange={(v) => setNewTicketForm({ ...newTicketForm, priority: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={newTicketForm.description}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                placeholder="Describe your issue in detail..."
                rows={5}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setNewTicketOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={newTicketSubmitting}>
                {newTicketSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit Ticket
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
