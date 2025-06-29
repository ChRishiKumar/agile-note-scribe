import { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, Tag, Calendar, Sparkles, BookOpen, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const createNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setNotes(prev => [note, ...prev]);
    setNewNote({ title: '', content: '', tags: '' });
    setIsCreateDialogOpen(false);
    toast.success('Note created successfully!');
  };

  const updateNote = () => {
    if (!editingNote || !newNote.title.trim() || !newNote.content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    setNotes(prev => prev.map(note => 
      note.id === editingNote.id 
        ? {
            ...note,
            title: newNote.title,
            content: newNote.content,
            tags: newNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            updatedAt: new Date().toISOString()
          }
        : note
    ));

    setEditingNote(null);
    setNewNote({ title: '', content: '', tags: '' });
    toast.success('Note updated successfully!');
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    toast.success('Note deleted successfully!');
  };

  const startEditing = (note: Note) => {
    setEditingNote(note);
    setNewNote({
      title: note.title,
      content: note.content,
      tags: note.tags.join(', ')
    });
  };

  const resetForm = () => {
    setNewNote({ title: '', content: '', tags: '' });
    setEditingNote(null);
  };

  // Get all unique tags
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  // Filter notes based on search term and selected tag
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || note.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRandomGradient = () => {
    const gradients = [
      'from-rose-100 via-pink-50 to-purple-100',
      'from-blue-100 via-cyan-50 to-teal-100',
      'from-amber-100 via-orange-50 to-red-100',
      'from-emerald-100 via-green-50 to-teal-100',
      'from-violet-100 via-purple-50 to-indigo-100',
      'from-yellow-100 via-amber-50 to-orange-100'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                My Notes
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
                onClick={() => window.location.href = '/login'}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Search and Create Section */}
      <div className="mb-10 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search your notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 border-2 border-gray-200 rounded-xl focus:border-purple-300 focus:ring-purple-200 shadow-sm transition-all duration-200"
            />
          </div>
          <Dialog open={isCreateDialogOpen || !!editingNote} onOpenChange={(open) => {
            if (!open) {
              setIsCreateDialogOpen(false);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)} 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Note
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] rounded-2xl border-0 shadow-2xl">
              <DialogHeader className="pb-6">
                <DialogTitle className="text-2xl font-bold text-gray-800">
                  {editingNote ? 'Edit Your Note' : 'Create New Note'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title" className="text-sm font-semibold text-gray-700 mb-2 block">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter a captivating title..."
                    value={newNote.title}
                    onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                    className="h-12 border-2 border-gray-200 rounded-xl focus:border-purple-300 focus:ring-purple-200"
                  />
                </div>
                <div>
                  <Label htmlFor="content" className="text-sm font-semibold text-gray-700 mb-2 block">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your thoughts here..."
                    value={newNote.content}
                    onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    className="border-2 border-gray-200 rounded-xl focus:border-purple-300 focus:ring-purple-200 resize-none"
                  />
                </div>
                <div>
                  <Label htmlFor="tags" className="text-sm font-semibold text-gray-700 mb-2 block">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="work, personal, ideas, inspiration..."
                    value={newNote.tags}
                    onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
                    className="h-12 border-2 border-gray-200 rounded-xl focus:border-purple-300 focus:ring-purple-200"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={editingNote ? updateNote : createNote}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {editingNote ? 'Update Note' : 'Create Note'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      resetForm();
                    }}
                    className="px-8 py-3 rounded-xl border-2 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Enhanced Tags Filter */}
        {allTags.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex flex-wrap gap-3">
              <Button
                variant={selectedTag === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTag('')}
                className={`h-10 px-4 rounded-full font-medium transition-all duration-200 ${
                  selectedTag === '' 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                    : 'border-2 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                All Notes
              </Button>
              {allTags.map(tag => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  className={`h-10 px-4 rounded-full font-medium transition-all duration-200 ${
                    selectedTag === tag
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'border-2 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <Tag className="h-3 w-3 mr-2" />
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 border border-gray-200 shadow-sm max-w-md mx-auto">
            <div className="text-gray-400 mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Edit3 className="h-12 w-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">No notes yet</h3>
              <p className="text-gray-500 text-lg">
                {searchTerm || selectedTag ? 'Try adjusting your search or filter' : 'Create your first note to get started'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNotes.map((note, index) => (
            <Card 
              key={note.id} 
              className={`group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br ${getRandomGradient()} border-0 shadow-lg backdrop-blur-sm overflow-hidden relative`}
            >
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
              <div className="relative z-10">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold line-clamp-2 pr-2 text-gray-800">
                      {note.title}
                    </CardTitle>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(note)}
                        className="h-9 w-9 p-0 hover:bg-blue-100 rounded-full transition-all duration-200 hover:scale-110"
                      >
                        <Edit3 className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNote(note.id)}
                        className="h-9 w-9 p-0 hover:bg-red-100 rounded-full transition-all duration-200 hover:scale-110"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 line-clamp-4 leading-relaxed">
                    {note.content}
                  </p>
                  
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {note.tags.map((tag, tagIndex) => (
                        <Badge 
                          key={tagIndex} 
                          variant="secondary" 
                          className="text-xs bg-white/80 text-purple-700 hover:bg-white font-medium px-3 py-1 rounded-full border border-purple-200"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center text-xs text-gray-600 bg-white/50 rounded-full px-3 py-2">
                    <Calendar className="h-3 w-3 mr-2" />
                    <span className="font-medium">
                      {note.updatedAt !== note.createdAt ? 'Updated' : 'Created'} {formatDate(note.updatedAt)}
                    </span>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Index;
