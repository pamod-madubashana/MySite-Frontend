import { useState, useEffect } from 'react';
import { projectApi } from '@/api/projectApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Plus, Edit, Trash2, Eye, Save, X, Star, ExternalLink, Github } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface Project {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  languages: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  status: 'draft' | 'published';
  thumbnail?: string;
  screenshots?: string[];
  createdAt: string;
  updatedAt: string;
}

const ProjectManager = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    tags: '',
    languages: '',
    githubUrl: '',
    liveUrl: '',
    featured: false,
    status: 'draft' as 'draft' | 'published',
    thumbnail: '',
    screenshots: ''
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [screenshotsFiles, setScreenshotsFiles] = useState<FileList | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const { token } = useAuth();

  // Handle image file selection
  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
    }
  };

  const handleScreenshotsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScreenshotsFiles(e.target.files);
  };

  // Create project with image upload
  const handleCreateProject = async () => {
    if (!token) {
      console.error('Authentication token is missing');
      alert('You must be logged in to create a project');
      return;
    }
    
    // Validate required fields
    if (!newProject.title.trim()) {
      console.error('Error: Title is required');
      alert('Title is required');
      return;
    }
    if (!newProject.description.trim()) {
      console.error('Error: Description is required');
      alert('Description is required');
      return;
    }
    
    const tagsArray = newProject.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    if (tagsArray.length === 0) {
      console.error('Error: At least one tag is required');
      alert('At least one tag is required');
      return;
    }
    
    setIsCreating(true);
    
    try {
      const formData = new FormData();
      
      // Add form fields to FormData
      formData.append('title', newProject.title);
      formData.append('description', newProject.description);
      formData.append('tags', JSON.stringify(tagsArray));
      const languagesArray = newProject.languages.split(',').map(lang => lang.trim()).filter(lang => lang);
      formData.append('languages', JSON.stringify(languagesArray));
      formData.append('status', newProject.status);
      formData.append('featured', newProject.featured.toString());
      
      // Always send githubUrl, even if empty, so backend knows to remove it
      formData.append('githubUrl', newProject.githubUrl.trim());
      
      // Always send liveUrl, even if empty, so backend knows to remove it
      formData.append('liveUrl', newProject.liveUrl.trim());
      
      // Add image files to FormData if selected
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
      
      if (screenshotsFiles) {
        for (let i = 0; i < screenshotsFiles.length; i++) {
          formData.append('screenshots', screenshotsFiles[i]);
        }
      }
      
      console.log('Sending request to create project with data:', {
        title: newProject.title,
        description: newProject.description,
        tags: tagsArray,
        hasThumbnail: !!thumbnailFile,
        screenshotCount: screenshotsFiles?.length || 0
      });
      
      // Use the new API method that handles image upload
      const result = await projectApi.createProjectWithImage(token, formData);
      console.log('Project created successfully:', result);
      
      setProjects([result.project, ...projects]);
      setNewProject({
        title: '',
        description: '',
        tags: '',
        languages: '',
        githubUrl: '',
        liveUrl: '',
        featured: false,
        status: 'draft',
        thumbnail: '',
        screenshots: ''
      });
      setThumbnailFile(null);
      setScreenshotsFiles(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating project with image:', error);
      alert('Failed to create project: ' + (error as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  // Update project with image upload
  const handleUpdateProject = async () => {
    if (!editingProject || !token) {
      if (!token) {
        console.error('Authentication token is missing');
        alert('You must be logged in to update a project');
      }
      return;
    }

    // Validate required fields
    if (!editingProject.title.trim()) {
      console.error('Error: Title is required');
      alert('Title is required');
      return;
    }
    if (!editingProject.description.trim()) {
      console.error('Error: Description is required');
      alert('Description is required');
      return;
    }
    
    if (editingProject.tags.length === 0) {
      console.error('Error: At least one tag is required');
      alert('At least one tag is required');
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const formData = new FormData();
      
      // Add form fields to FormData
      formData.append('title', editingProject.title);
      formData.append('description', editingProject.description);
      formData.append('tags', JSON.stringify(editingProject.tags));
      formData.append('languages', JSON.stringify(editingProject.languages));
      formData.append('featured', editingProject.featured.toString());
      formData.append('status', editingProject.status);
      
      // Always send githubUrl, even if empty, so backend knows to remove it
      formData.append('githubUrl', editingProject.githubUrl?.trim() || '');
      
      // Always send liveUrl, even if empty, so backend knows to remove it
      formData.append('liveUrl', editingProject.liveUrl?.trim() || '');
      
      // Add image files to FormData if selected
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
      
      if (screenshotsFiles) {
        for (let i = 0; i < screenshotsFiles.length; i++) {
          formData.append('screenshots', screenshotsFiles[i]);
        }
      }
      
      console.log('Sending request to update project with data:', {
        id: editingProject._id,
        title: editingProject.title,
        hasThumbnail: !!thumbnailFile,
        screenshotCount: screenshotsFiles?.length || 0
      });
      
      // Use the new API method that handles image upload
      const result = await projectApi.updateProjectWithImage(editingProject._id, token, formData);
      console.log('Project updated successfully:', result);
      
      setProjects(projects.map(p => p._id === editingProject._id ? result.project : p));
      setEditingProject(null);
      setThumbnailFile(null);
      setScreenshotsFiles(null);
    } catch (error) {
      console.error('Error updating project with image:', error);
      alert('Failed to update project: ' + (error as Error).message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectApi.getAllProjects(token);
        setProjects(data.projects || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [token]);

  // Filter projects based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProjects(projects);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredProjects(
        projects.filter(project => 
          project.title.toLowerCase().includes(term) ||
          project.description.toLowerCase().includes(term) ||
          project.tags.some(tech => tech.toLowerCase().includes(term))
        )
      );
    }
  }, [searchTerm, projects]);

  const handleDeleteProject = async (id: string) => {
    setProjectToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete || !token) return;
    
    try {
      await projectApi.deleteProject(projectToDelete, token);
      setProjects(projects.filter(project => project._id !== projectToDelete));
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const toggleFeatured = async (id: string) => {
    const project = projects.find(p => p._id === id);
    if (!project) return;

    try {
      // Prepare project data
      const projectData: any = {
        ...project,
        featured: !project.featured
      };
      
      const result = await projectApi.updateProject(id, token, projectData);
      
      setProjects(projects.map(p => p._id === id ? result.project : p));
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  const togglePublish = async (id: string) => {
    const project = projects.find(p => p._id === id);
    if (!project) return;

    try {
      // Prepare project data
      const projectData: any = {
        ...project,
        status: project.status === 'published' ? 'draft' : 'published'
      };
      
      const result = await projectApi.updateProject(id, token, projectData);
      
      setProjects(projects.map(p => p._id === id ? result.project : p));
    } catch (error) {
      console.error('Error toggling publish status:', error);
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
              <h1 className="text-3xl font-bold text-white">Project Manager</h1>
              <p className="text-muted-foreground">Manage your projects and portfolio items</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border border-gray-700">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newProject.title}
                      onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                      placeholder="Enter project title"
                      className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                      placeholder="Describe your project"
                      rows={4}
                      className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={newProject.tags}
                      onChange={(e) => setNewProject({...newProject, tags: e.target.value})}
                      placeholder="React, Node.js, MongoDB, etc."
                      className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="languages">Languages (comma separated)</Label>
                    <Input
                      id="languages"
                      value={newProject.languages}
                      onChange={(e) => setNewProject({...newProject, languages: e.target.value})}
                      placeholder="JavaScript, TypeScript, Python, etc."
                      className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="githubUrl">GitHub URL</Label>
                      <Input
                        id="githubUrl"
                        type="url"
                        value={newProject.githubUrl}
                        onChange={(e) => setNewProject({...newProject, githubUrl: e.target.value})}
                        placeholder="https://github.com/username/repo"
                        className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="liveUrl">Live URL</Label>
                      <Input
                        id="liveUrl"
                        type="url"
                        value={newProject.liveUrl}
                        onChange={(e) => setNewProject({...newProject, liveUrl: e.target.value})}
                        placeholder="https://project-name.vercel.app"
                        className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="thumbnail">Thumbnail</Label>
                    <div className="flex gap-2">
                      <Input
                        id="thumbnail"
                        type="url"
                        value={newProject.thumbnail}
                        onChange={(e) => setNewProject({...newProject, thumbnail: e.target.value})}
                        placeholder="https://example.com/image.jpg"
                        className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('file-upload-project-create')?.click()}
                        disabled={false}
                        className="border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        Choose File
                      </Button>
                      <Input
                        id="file-upload-project-create"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailFileChange}
                        className="hidden"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">Enter image URL or upload a file (JPG, PNG, GIF)</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="screenshots">Screenshots</Label>
                    <div className="flex gap-2">
                      <Input
                        id="screenshots"
                        value={newProject.screenshots}
                        onChange={(e) => setNewProject({...newProject, screenshots: e.target.value})}
                        placeholder="Upload screenshots"
                        className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                        readOnly
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('file-upload-screenshots-create')?.click()}
                        disabled={false}
                        className="border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        Choose Files
                      </Button>
                      <Input
                        id="file-upload-screenshots-create"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleScreenshotsFileChange}
                        className="hidden"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">Select multiple screenshot files (JPG, PNG, GIF)</p>
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="status"
                          checked={newProject.status === 'draft'}
                          onChange={() => setNewProject({...newProject, status: 'draft'})}
                        />
                        Draft
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="status"
                          checked={newProject.status === 'published'}
                          onChange={() => setNewProject({...newProject, status: 'published'})}
                        />
                        Published
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={newProject.featured}
                      onChange={(e) => setNewProject({...newProject, featured: e.target.checked})}
                    />
                    <Label htmlFor="featured">Featured Project</Label>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateProject} disabled={isCreating}>
                      {isCreating ? 'Creating...' : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Create Project
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
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="glass border border-primary/30">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No projects found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project._id} className="glass border border-primary/30">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={project.status === 'published' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                      {project.featured && (
                        <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    {formatDate(project.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tech, index) => (
                      <Badge key={index} variant="outline">{tech}</Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 mb-4">
                    {project.githubUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4 mr-2" />
                          Code
                        </a>
                      </Button>
                    )}
                    {project.liveUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Live
                        </a>
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProject(project)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFeatured(project._id)}
                      className={project.featured ? "text-yellow-500 border-yellow-500 bg-yellow-500/10" : "text-muted-foreground"}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      {project.featured ? 'Featured' : 'Feature'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublish(project._id)}
                    >
                      {project.status === 'published' ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProject(project._id)}
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

        {/* Edit Project Dialog */}
        {editingProject && (
          <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border border-gray-700">
              <DialogHeader>
                <DialogTitle>Edit Project</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editingProject.title}
                    onChange={(e) => setEditingProject({...editingProject, title: e.target.value})}
                    placeholder="Enter project title"
                    className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editingProject.description}
                    onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                    placeholder="Describe your project"
                    rows={4}
                    className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                  <Input
                    id="edit-tags"
                    value={editingProject.tags.join(', ')}
                    onChange={(e) => setEditingProject({...editingProject, tags: e.target.value.split(',').map(tag => tag.trim())})}
                    placeholder="React, Node.js, MongoDB, etc."
                    className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-languages">Languages (comma separated)</Label>
                  <Input
                    id="edit-languages"
                    value={editingProject.languages.join(', ')}
                    onChange={(e) => setEditingProject({...editingProject, languages: e.target.value.split(',').map(lang => lang.trim())})}
                    placeholder="JavaScript, TypeScript, Python, etc."
                    className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-githubUrl">GitHub URL</Label>
                    <Input
                      id="edit-githubUrl"
                      type="url"
                      value={editingProject.githubUrl || ''}
                      onChange={(e) => setEditingProject({...editingProject, githubUrl: e.target.value})}
                      placeholder="https://github.com/username/repo"
                      className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-liveUrl">Live URL</Label>
                    <Input
                      id="edit-liveUrl"
                      type="url"
                      value={editingProject.liveUrl || ''}
                      onChange={(e) => setEditingProject({...editingProject, liveUrl: e.target.value})}
                      placeholder="https://project-name.vercel.app"
                      className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-thumbnail">Thumbnail</Label>
                  <div className="flex gap-2">
                    <Input
                      id="edit-thumbnail"
                      type="url"
                      value={editingProject.thumbnail || ''}
                      onChange={(e) => setEditingProject({...editingProject, thumbnail: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                      className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('file-upload-project-edit')?.click()}
                      className="border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      Choose File
                    </Button>
                    <Input
                      id="file-upload-project-edit"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailFileChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">Enter image URL or upload a file (JPG, PNG, GIF)</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-screenshots">Screenshots</Label>
                  <div className="flex gap-2">
                    <Input
                      id="edit-screenshots"
                      value={editingProject.screenshots?.length ? `${editingProject.screenshots.length} files selected` : ''}
                      placeholder="Upload screenshots"
                      className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                      readOnly
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('file-upload-screenshots-edit')?.click()}
                      className="border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      Choose Files
                    </Button>
                    <Input
                      id="file-upload-screenshots-edit"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleScreenshotsFileChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">Select multiple screenshot files (JPG, PNG, GIF)</p>
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="edit-status"
                        checked={editingProject.status === 'draft'}
                        onChange={() => setEditingProject({...editingProject, status: 'draft'})}
                      />
                      Draft
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="edit-status"
                        checked={editingProject.status === 'published'}
                        onChange={() => setEditingProject({...editingProject, status: 'published'})}
                      />
                      Published
                    </label>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-featured"
                    checked={editingProject.featured}
                    onChange={(e) => setEditingProject({...editingProject, featured: e.target.checked})}
                  />
                  <Label htmlFor="edit-featured">Featured Project</Label>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setEditingProject(null)}
                    className="border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateProject} disabled={isUpdating}>
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
          setProjectToDelete(null);
        }}
        onConfirm={confirmDeleteProject}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

      </div>
    </div>
  );
};

export default ProjectManager;