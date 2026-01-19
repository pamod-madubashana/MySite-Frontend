import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Save, 
  Code,
  Server,
  Database,
  Cloud,
  Cpu
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/apiConfig';
import { reorderItemsForInsertion, reorderItemsForUpdate, reorderItemsForDeletion, reorderAllItemsContiguously } from '@/lib/orderUtils';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface TechStackCategory {
  _id: string;
  title: string;
  icon: string; // e.g., 'frontend', 'backend', 'database', 'devops', 'general'
  skills: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

const TechStackManager = () => {
  const { token } = useAuth();
  const [techStackCategories, setTechStackCategories] = useState<TechStackCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<TechStackCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TechStackCategory | null>(null);
  const [newCategory, setNewCategory] = useState({
    title: '',
    icon: 'Cpu',
    skills: [''] as string[],
    order: 0
  });
  
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    id: '',
    type: ''
  });

  // Fetch tech stack categories
  useEffect(() => {
    const fetchTechStackCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/tech-stack-categories`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setTechStackCategories(data);
        }
      } catch (error) {
        console.error('Error fetching tech stack categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTechStackCategories();
  }, [token]);

  // Filter tech stack categories based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCategories(techStackCategories);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredCategories(
        techStackCategories.filter(category => 
          category.title.toLowerCase().includes(term) ||
          category.skills.some(skill => skill.toLowerCase().includes(term))
        )
      );
    }
  }, [searchTerm, techStackCategories]);

  const handleCreateCategory = async () => {
    try {
      // Reorder items for insertion
      await reorderItemsForInsertion(techStackCategories, newCategory.order, '/tech-stack-categories', token);
      
      const response = await fetch(`${API_BASE_URL}/tech-stack-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newCategory,
          skills: newCategory.skills.filter(skill => skill.trim() !== '') // Remove empty skills
        })
      });

      if (response.ok) {
        // Refresh the list to get updated orders
        const refreshResponse = await fetch(`${API_BASE_URL}/tech-stack-categories`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const refreshedData = await refreshResponse.json();
        setTechStackCategories(refreshedData);
        setNewCategory({
          title: '',
          icon: 'Cpu',
          skills: [''],
          order: 0
        });
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating tech stack category:', error);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      // Reorder items for update
      await reorderItemsForUpdate(techStackCategories, editingCategory._id, editingCategory.order, '/tech-stack-categories', token);
      
      const response = await fetch(`${API_BASE_URL}/tech-stack-categories/${editingCategory._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editingCategory,
          skills: editingCategory.skills.filter(skill => skill.trim() !== '') // Remove empty skills
        })
      });

      if (response.ok) {
        // Refresh the list to get updated orders
        const refreshResponse = await fetch(`${API_BASE_URL}/tech-stack-categories`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const refreshedData = await refreshResponse.json();
        setTechStackCategories(refreshedData);
        setEditingCategory(null);
      }
    } catch (error) {
      console.error('Error updating tech stack category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      // Find the deleted item to get its order
      const deletedCategory = techStackCategories.find(cat => cat._id === id);
      if (!deletedCategory) return;
      
      // Reorder items for deletion
      await reorderItemsForDeletion(techStackCategories, deletedCategory.order, '/tech-stack-categories', token);
      
      const response = await fetch(`${API_BASE_URL}/tech-stack-categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Refresh the list to get updated orders
        const refreshResponse = await fetch(`${API_BASE_URL}/tech-stack-categories`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const refreshedData = await refreshResponse.json();
        setTechStackCategories(refreshedData);
      }
    } catch (error) {
      console.error('Error deleting tech stack category:', error);
    }
  };
  
  const openConfirmDialog = (id: string, type: string) => {
    setConfirmDialog({ isOpen: true, id, type });
  };
  
  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, id: '', type: '' });
  };
  
  const confirmDelete = () => {
    handleDeleteCategory(confirmDialog.id);
    closeConfirmDialog();
  };

  const getIconComponent = (iconName: string) => {
    switch(iconName.toLowerCase()) {
      case 'code':
      case 'frontend':
        return Code;
      case 'server':
      case 'backend':
        return Server;
      case 'database':
        return Database;
      case 'cloud':
      case 'devops':
        return Cloud;
      case 'cpu':
      case 'general':
      default:
        return Cpu;
    }
  };

  const addSkillField = (isEditing: boolean) => {
    if (isEditing && editingCategory) {
      setEditingCategory({
        ...editingCategory,
        skills: [...editingCategory.skills, '']
      });
    } else {
      setNewCategory({
        ...newCategory,
        skills: [...newCategory.skills, '']
      });
    }
  };

  const updateSkillField = (index: number, value: string, isEditing: boolean) => {
    if (isEditing && editingCategory) {
      const updatedSkills = [...editingCategory.skills];
      updatedSkills[index] = value;
      setEditingCategory({
        ...editingCategory,
        skills: updatedSkills
      });
    } else {
      const updatedSkills = [...newCategory.skills];
      updatedSkills[index] = value;
      setNewCategory({
        ...newCategory,
        skills: updatedSkills
      });
    }
  };

  const removeSkillField = (index: number, isEditing: boolean) => {
    if (isEditing && editingCategory) {
      const updatedSkills = editingCategory.skills.filter((_, i) => i !== index);
      setEditingCategory({
        ...editingCategory,
        skills: updatedSkills
      });
    } else {
      const updatedSkills = newCategory.skills.filter((_, i) => i !== index);
      setNewCategory({
        ...newCategory,
        skills: updatedSkills
      });
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Tech Stack Categories Manager</h1>
              <p className="text-muted-foreground">Manage your technology stack categories and skills</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Category
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border border-gray-700">
                <DialogHeader>
                  <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Category Title</Label>
                    <Input
                      id="title"
                      value={editingCategory ? editingCategory.title : newCategory.title}
                      onChange={(e) => 
                        editingCategory 
                          ? setEditingCategory({...editingCategory, title: e.target.value}) 
                          : setNewCategory({...newCategory, title: e.target.value})
                      }
                      placeholder="e.g., Frontend, Backend, Database"
                      className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="icon">Icon</Label>
                      <select
                        id="icon"
                        value={editingCategory ? editingCategory.icon : newCategory.icon}
                        onChange={(e) => 
                          editingCategory 
                            ? setEditingCategory({...editingCategory, icon: e.target.value}) 
                            : setNewCategory({...newCategory, icon: e.target.value})
                        }
                        className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <option value="Code">Code (Frontend)</option>
                        <option value="Server">Server (Backend)</option>
                        <option value="Database">Database</option>
                        <option value="Cloud">Cloud (DevOps)</option>
                        <option value="Cpu">CPU (General)</option>
                      </select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="order">Order</Label>
                      <Input
                        id="order"
                        type="number"
                        value={editingCategory ? editingCategory.order : newCategory.order}
                        onChange={(e) => 
                          editingCategory 
                            ? setEditingCategory({...editingCategory, order: parseInt(e.target.value)}) 
                            : setNewCategory({...newCategory, order: parseInt(e.target.value)})
                        }
                        placeholder="Order position"
                        className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <Label>Skills</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => addSkillField(!!editingCategory)}
                        className="border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        Add Skill
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(editingCategory ? editingCategory.skills : newCategory.skills).map((skill, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={skill}
                            onChange={(e) => updateSkillField(index, e.target.value, !!editingCategory)}
                            placeholder={`Skill ${index + 1}`}
                            className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                          />
                          {(editingCategory ? editingCategory.skills : newCategory.skills).length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeSkillField(index, !!editingCategory)}
                              className="border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingCategory(null);
                      }}
                      className="border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      Cancel
                    </Button>
                    <Button onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}>
                      <Save className="w-4 h-4 mr-2" />
                      {editingCategory ? 'Update' : 'Add'}
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
              placeholder="Search tech stack categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading tech stack categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <Card className="glass border border-primary/30">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No tech stack categories found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => {
              const IconComponent = getIconComponent(category.icon);
              return (
                <Card key={category._id} className="glass border border-primary/30 relative">
                  <div className="absolute -top-2 -left-2 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-10">
                    {category.order}
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <IconComponent className="w-5 h-5 text-primary" />
                          {category.title}
                        </CardTitle>
                        <CardDescription className="mt-1">Skills: {category.skills.length}</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingCategory(category);
                            setIsDialogOpen(true);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openConfirmDialog(category._id, 'delete')}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {category.skills.map((skill, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {skill}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
    <ConfirmDialog
      isOpen={confirmDialog.isOpen}
      onClose={closeConfirmDialog}
      onConfirm={confirmDelete}
      title="Confirm Deletion"
      message="Are you sure you want to delete this tech stack category? This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      variant="destructive"
    />
    </>
  );
};

export default TechStackManager;