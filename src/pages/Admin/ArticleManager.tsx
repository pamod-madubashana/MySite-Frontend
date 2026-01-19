import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Plus, Edit, Trash2, Eye, Save, X } from 'lucide-react';
import { articleApi, Article, CreateArticleData, UpdateArticleData } from '@/api/articleApi';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const ArticleManager = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    status: 'draft' as 'draft' | 'published',
    tags: '' // Will be converted to array
  });
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const { token } = useAuth();

  // Handle image file selection
  const handleFeaturedImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImageFile(file);
    }
  };

  // Create article with image upload
  const handleCreateArticle = async () => {
    if (!token) {
      console.error('Authentication token is missing');
      alert('You must be logged in to create an article');
      return;
    }
    
    setIsCreating(true);
    
    try {
      const formData = new FormData();
      
      // Add form fields to FormData
      formData.append('title', newArticle.title);
      formData.append('content', newArticle.content);
      formData.append('excerpt', newArticle.excerpt);
      formData.append('status', newArticle.status);
      formData.append('tags', JSON.stringify(newArticle.tags.split(',').map(tag => tag.trim()).filter(tag => tag)));
      
      // Add image file to FormData if selected
      if (featuredImageFile) {
        formData.append('featuredImage', featuredImageFile);
      }
      
      console.log('Sending request to create article with data:', {
        title: newArticle.title,
        hasFeaturedImage: !!featuredImageFile
      });
      
      // Use the new API method that handles image upload
      const response = await articleApi.createArticleWithImage(token, formData);
      console.log('Article created successfully:', response);
      
      setArticles([response.article, ...articles]);
      setNewArticle({
        title: '',
        content: '',
        excerpt: '',
        featuredImage: '',
        status: 'draft',
        tags: ''
      });
      setFeaturedImageFile(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating article with image:', error);
      alert('Failed to create article: ' + (error as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  // Update article with image upload
  const handleUpdateArticle = async () => {
    if (!editingArticle || !token) {
      if (!token) {
        console.error('Authentication token is missing');
        alert('You must be logged in to update an article');
      }
      return;
    }

    setIsUpdating(true);
    
    try {
      const formData = new FormData();
      
      // Add form fields to FormData
      formData.append('title', editingArticle.title);
      formData.append('content', editingArticle.content);
      formData.append('excerpt', editingArticle.excerpt);
      formData.append('status', editingArticle.status);
      formData.append('tags', JSON.stringify(editingArticle.tags));
      
      // Add image file to FormData if selected
      if (featuredImageFile) {
        formData.append('featuredImage', featuredImageFile);
      }
      
      console.log('Sending request to update article with data:', {
        id: editingArticle._id,
        title: editingArticle.title,
        hasFeaturedImage: !!featuredImageFile
      });
      
      // Use the new API method that handles image upload
      const response = await articleApi.updateArticleWithImage(token, editingArticle._id, formData);
      console.log('Article updated successfully:', response);
      
      setArticles(articles.map(a => a._id === editingArticle._id ? response.article : a));
      setEditingArticle(null);
      setFeaturedImageFile(null);
    } catch (error) {
      console.error('Error updating article with image:', error);
      alert('Failed to update article: ' + (error as Error).message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await articleApi.getAllArticles(token);
        setArticles(data.articles || []);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [token]);

  // Filter articles based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredArticles(articles);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredArticles(
        articles.filter(article => 
          article.title.toLowerCase().includes(term) ||
          article.content.toLowerCase().includes(term) ||
          article.tags.some(tag => tag.toLowerCase().includes(term))
        )
      );
    }
  }, [searchTerm, articles]);

  const handleDeleteArticle = async (id: string) => {
    setArticleToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteArticle = async () => {
    if (!articleToDelete || !token) return;
    
    try {
      await articleApi.deleteArticle(token, articleToDelete);
      setArticles(articles.filter(article => article._id !== articleToDelete));
    } catch (error) {
      console.error('Error deleting article:', error);
    } finally {
      setIsDeleteDialogOpen(false);
      setArticleToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Article Manager</h1>
              <p className="text-muted-foreground">Manage your blog posts and articles</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Article
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border border-gray-700">
                <DialogHeader>
                  <DialogTitle>Create New Article</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newArticle.title}
                      onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                      placeholder="Enter article title"
                      className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"/>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={newArticle.excerpt}
                      onChange={(e) => setNewArticle({...newArticle, excerpt: e.target.value})}
                      placeholder="Brief description of the article"
                      rows={3}
                      className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="featuredImage">Featured Image</Label>
                    <div className="flex gap-2">
                      <Input
                        id="featuredImage"
                        type="url"
                        value={newArticle.featuredImage}
                        onChange={(e) => setNewArticle({...newArticle, featuredImage: e.target.value})}
                        placeholder="https://example.com/image.jpg"
                        className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('file-upload-create')?.click()}
                        className="border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        Choose File
                      </Button>
                      <Input
                        id="file-upload-create"
                        type="file"
                        accept="image/*"
                        onChange={handleFeaturedImageFileChange}
                        className="hidden"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">Enter image URL or upload a file (JPG, PNG, GIF)</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={newArticle.content}
                      onChange={(e) => setNewArticle({...newArticle, content: e.target.value})}
                      placeholder="Write your article content here..."
                      rows={8}
                      className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={newArticle.tags}
                      onChange={(e) => setNewArticle({...newArticle, tags: e.target.value})}
                      placeholder="tag1, tag2, tag3"
                      className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="status"
                          checked={newArticle.status === 'draft'}
                          onChange={() => setNewArticle({...newArticle, status: 'draft'})}
                        />
                        Draft
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="status"
                          checked={newArticle.status === 'published'}
                          onChange={() => setNewArticle({...newArticle, status: 'published'})}
                        />
                        Published
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateArticle} disabled={isCreating}>
                      {isCreating ? 'Creating...' : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Create Article
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading articles...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <Card className="glass border border-primary/30">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No articles found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Card key={article._id} className="glass border border-primary/30">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{article.title}</CardTitle>
                    <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                      {article.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    By {article.author?.username || 'Unknown Author'} • {formatDate(article.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {article.excerpt || article.content.substring(0, 100) + '...'}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingArticle(article);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteArticle(article._id)}
                      className="text-red-500 border-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Article Dialog */}
        {editingArticle && (
          <Dialog open={!!editingArticle} onOpenChange={(open) => !open && setEditingArticle(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border border-gray-700">
              <DialogHeader>
                <DialogTitle>Edit Article</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editingArticle.title}
                    onChange={(e) => setEditingArticle({...editingArticle, title: e.target.value})}
                    placeholder="Enter article title"
                    className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-excerpt">Excerpt</Label>
                  <Textarea
                    id="edit-excerpt"
                    value={editingArticle.excerpt}
                    onChange={(e) => setEditingArticle({...editingArticle, excerpt: e.target.value})}
                    placeholder="Brief description of the article"
                    rows={3}
                    className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-featuredImage">Featured Image</Label>
                  <div className="flex gap-2">
                    <Input
                      id="edit-featuredImage"
                      type="url"
                      value={editingArticle.featuredImage || ''}
                      onChange={(e) => setEditingArticle({...editingArticle, featuredImage: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                      className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('file-upload-edit')?.click()}
                      className="border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      Choose File
                    </Button>
                    <Input
                      id="file-upload-edit"
                      type="file"
                      accept="image/*"
                      onChange={handleFeaturedImageFileChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">Enter image URL or upload a file (JPG, PNG, GIF)</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-content">Content</Label>
                  <Textarea
                    id="edit-content"
                    value={editingArticle.content}
                    onChange={(e) => setEditingArticle({...editingArticle, content: e.target.value})}
                    placeholder="Write your article content here..."
                    rows={8}
                    className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                  <Input
                    id="edit-tags"
                    value={editingArticle.tags.join(', ')}
                    onChange={(e) => setEditingArticle({...editingArticle, tags: e.target.value.split(',').map(tag => tag.trim())})}
                    placeholder="tag1, tag2, tag3"
                    className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="edit-status"
                        checked={editingArticle.status === 'draft'}
                        onChange={() => setEditingArticle({...editingArticle, status: 'draft'})}
                      />
                      Draft
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="edit-status"
                        checked={editingArticle.status === 'published'}
                        onChange={() => setEditingArticle({...editingArticle, status: 'published'})}
                      />
                      Published
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setEditingArticle(null)}
                    className="border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateArticle} disabled={isUpdating}>
                    {isUpdating ? 'Saving...' : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setArticleToDelete(null);
        }}
        onConfirm={confirmDeleteArticle}
        title="Delete Article"
        message="Are you sure you want to delete this article? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

      </div>
    </div>
  );
};

export default ArticleManager;