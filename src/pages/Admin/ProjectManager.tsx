import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Plus, Edit, Trash2, Eye, Save, X, Star, ExternalLink, Github } from 'lucide-react';

interface Project {
  _id: string;
  title: string;
  description: string;
  techStack: string[];
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
    techStack: '',
    githubUrl: '',
    liveUrl: '',
    featured: false,
    status: 'draft' as 'draft' | 'published',
    thumbnail: '',
    screenshots: ''
  });
  const { token } = useAuth();

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects/all', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setProjects(data.projects || []);
        }
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
          project.techStack.some(tech => tech.toLowerCase().includes(term))
        )
      );
    }
  }, [searchTerm, projects]);

  const handleCreateProject = async () => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newProject,
          techStack: newProject.techStack.split(',').map(tag => tag.trim()).filter(tag => tag),
          screenshots: newProject.screenshots ? newProject.screenshots.split(',').map(url => url.trim()).filter(url => url) : []
        })
      });

      if (response.ok) {
        const data = await response.json();
        setProjects([data.project, ...projects]);
        setNewProject({
          title: '',
          description: '',
          techStack: '',
          githubUrl: '',
          liveUrl: '',
          featured: false,
          status: 'draft',
          thumbnail: '',
          screenshots: ''
        });
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleUpdateProject = async () => {
    if (!editingProject) return;

    try {
      const response = await fetch(`/api/projects/${editingProject._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editingProject.title,
          description: editingProject.description,
          techStack: editingProject.techStack,
          githubUrl: editingProject.githubUrl,
          liveUrl: editingProject.liveUrl,
          featured: editingProject.featured,
          status: editingProject.status,
          thumbnail: editingProject.thumbnail,
          screenshots: editingProject.screenshots
        })
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(projects.map(p => p._id === editingProject._id ? data.project : p));
        setEditingProject(null);
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await fetch(`/api/projects/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setProjects(projects.filter(project => project._id !== id));
        }
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const toggleFeatured = async (id: string) => {
    const project = projects.find(p => p._id === id);
    if (!project) return;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...project,
          featured: !project.featured
        })
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(projects.map(p => p._id === id ? data.project : p));
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  const togglePublish = async (id: string) => {
    const project = projects.find(p => p._id === id);
    if (!project) return;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...project,
          status: project.status === 'published' ? 'draft' : 'published'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(projects.map(p => p._id === id ? data.project : p));
      }
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
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="techStack">Tech Stack (comma separated)</Label>
                    <Input
                      id="techStack"
                      value={newProject.techStack}
                      onChange={(e) => setNewProject({...newProject, techStack: e.target.value})}
                      placeholder="React, Node.js, MongoDB, etc."
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
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="thumbnail">Thumbnail URL</Label>
                    <Input
                      id="thumbnail"
                      type="url"
                      value={newProject.thumbnail}
                      onChange={(e) => setNewProject({...newProject, thumbnail: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="screenshots">Screenshots URLs (comma separated)</Label>
                    <Input
                      id="screenshots"
                      value={newProject.screenshots}
                      onChange={(e) => setNewProject({...newProject, screenshots: e.target.value})}
                      placeholder="https://example.com/screenshot1.jpg, https://example.com/screenshot2.jpg"
                    />
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
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateProject}>
                      <Save className="w-4 h-4 mr-2" />
                      Create Project
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
              className="pl-10"
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
                    {project.techStack.map((tech, index) => (
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
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-techStack">Tech Stack (comma separated)</Label>
                  <Input
                    id="edit-techStack"
                    value={editingProject.techStack.join(', ')}
                    onChange={(e) => setEditingProject({...editingProject, techStack: e.target.value.split(',').map(tag => tag.trim())})}
                    placeholder="React, Node.js, MongoDB, etc."
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
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-thumbnail">Thumbnail URL</Label>
                  <Input
                    id="edit-thumbnail"
                    type="url"
                    value={editingProject.thumbnail || ''}
                    onChange={(e) => setEditingProject({...editingProject, thumbnail: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-screenshots">Screenshots URLs (comma separated)</Label>
                  <Input
                    id="edit-screenshots"
                    value={editingProject.screenshots?.join(', ') || ''}
                    onChange={(e) => setEditingProject({...editingProject, screenshots: e.target.value.split(',').map(url => url.trim())})}
                    placeholder="https://example.com/screenshot1.jpg, https://example.com/screenshot2.jpg"
                  />
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
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateProject}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default ProjectManager;