
import { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, Tag, Calendar } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Notes</h1>
          <p className="text-gray-600">Capture your thoughts and ideas</p>
        </div>

        {/* Search and Create Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isCreateDialogOpen || !!editingNote} onOpenChange={(open) => {
              if (!open) {
                setIsCreateDialogOpen(false);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Note
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{editingNote ? 'Edit Note' : 'Create New Note'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter note title..."
                      value={newNote.title}
                      onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Write your note content here..."
                      value={newNote.content}
                      onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                      rows={6}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      placeholder="work, personal, ideas..."
                      value={newNote.tags}
                      onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={editingNote ? updateNote : createNote}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {editingNote ? 'Update Note' : 'Create Note'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedTag === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTag('')}
                className="h-8"
              >
                All
              </Button>
              {allTags.map(tag => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  className="h-8"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Edit3 className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No notes found</h3>
              <p>{searchTerm || selectedTag ? 'Try adjusting your search or filter' : 'Create your first note to get started'}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 bg-white border-0 shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2 pr-2">{note.title}</CardTitle>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(note)}
                        className="h-8 w-8 p-0 hover:bg-blue-100"
                      >
                        <Edit3 className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNote(note.id)}
                        className="h-8 w-8 p-0 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 line-clamp-3">{note.content}</p>
                  
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {note.updatedAt !== note.createdAt ? 'Updated' : 'Created'} {formatDate(note.updatedAt)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
