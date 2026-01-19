import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
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

interface TechSkill {
  _id: string;
  name: string;
  level: number; // 0-100 percentage
  category?: string; // Not used but kept for compatibility
  order: number;
  createdAt: string;
  updatedAt: string;
}

const TechSkillsManager = () => {
  const { token } = useAuth();
  const [techSkills, setTechSkills] = useState<TechSkill[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<TechSkill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<TechSkill | null>(null);
  const [newSkill, setNewSkill] = useState({
    name: '',
    level: 50,
    order: 0
  });
  
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    id: '',
    type: ''
  });

  // Fetch tech skills
  useEffect(() => {
    const fetchTechSkills = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/tech-skills`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setTechSkills(data);
        }
      } catch (error) {
        console.error('Error fetching tech skills:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTechSkills();
  }, [token]);

  // Filter tech skills based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredSkills(techSkills);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredSkills(
        techSkills.filter(skill => 
          skill.name.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, techSkills]);

  const handleCreateSkill = async () => {
    try {
      // Reorder items for insertion
      await reorderItemsForInsertion(techSkills, newSkill.order, '/tech-skills', token);
      
      const response = await fetch(`${API_BASE_URL}/tech-skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSkill)
      });

      if (response.ok) {
        // Refresh the list to get updated orders
        const refreshResponse = await fetch(`${API_BASE_URL}/tech-skills`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const refreshedData = await refreshResponse.json();
        setTechSkills(refreshedData);
        setNewSkill({
          name: '',
          level: 50,
          order: 0
        });
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating tech skill:', error);
    }
  };

  const handleUpdateSkill = async () => {
    if (!editingSkill) return;

    try {
      // Reorder items for update
      await reorderItemsForUpdate(techSkills, editingSkill._id, editingSkill.order, '/tech-skills', token);
      
      const response = await fetch(`${API_BASE_URL}/tech-skills/${editingSkill._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingSkill)
      });

      if (response.ok) {
        // Refresh the list to get updated orders
        const refreshResponse = await fetch(`${API_BASE_URL}/tech-skills`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const refreshedData = await refreshResponse.json();
        setTechSkills(refreshedData);
        setEditingSkill(null);
      }
    } catch (error) {
      console.error('Error updating tech skill:', error);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      // Find the deleted item to get its order
      const deletedSkill = techSkills.find(skill => skill._id === id);
      if (!deletedSkill) return;
      
      // Reorder items for deletion
      await reorderItemsForDeletion(techSkills, deletedSkill.order, '/tech-skills', token);
      
      const response = await fetch(`${API_BASE_URL}/tech-skills/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Refresh the list to get updated orders
        const refreshResponse = await fetch(`${API_BASE_URL}/tech-skills`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const refreshedData = await refreshResponse.json();
        setTechSkills(refreshedData);
      }
    } catch (error) {
      console.error('Error deleting tech skill:', error);
    }
  };
  
  const openConfirmDialog = (id: string, type: string) => {
    setConfirmDialog({ isOpen: true, id, type });
  };
  
  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, id: '', type: '' });
  };
  
  const confirmDelete = () => {
    handleDeleteSkill(confirmDialog.id);
    closeConfirmDialog();
  };

  const getIconByCategory = (category?: string) => {
    if (!category) return Cpu;
    switch(category.toLowerCase()) {
      case 'frontend':
        return Code;
      case 'backend':
        return Server;
      case 'database':
        return Database;
      case 'devops':
        return Cloud;
      case 'general':
      default:
        return Cpu;
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Tech Skills Manager</h1>
              <p className="text-muted-foreground">Manage your technology skills</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Skill
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border border-gray-700">
                <DialogHeader>
                  <DialogTitle>{editingSkill ? 'Edit Skill' : 'Add New Skill'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Skill Name</Label>
                    <Input
                      id="name"
                      value={editingSkill ? editingSkill.name : newSkill.name}
                      onChange={(e) => 
                        editingSkill 
                          ? setEditingSkill({...editingSkill, name: e.target.value}) 
                          : setNewSkill({...newSkill, name: e.target.value})
                      }
                      placeholder="e.g., JavaScript, Python, React"
                      className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="level">Proficiency Level: {editingSkill ? editingSkill.level : newSkill.level}%</Label>
                    <Slider
                      id="level"
                      min={0}
                      max={100}
                      step={1}
                      value={[editingSkill ? editingSkill.level : newSkill.level]}
                      onValueChange={(value) => 
                        editingSkill 
                          ? setEditingSkill({...editingSkill, level: value[0]}) 
                          : setNewSkill({...newSkill, level: value[0]})
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="order">Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={editingSkill ? editingSkill.order : newSkill.order}
                      onChange={(e) => 
                        editingSkill 
                          ? setEditingSkill({...editingSkill, order: parseInt(e.target.value)}) 
                          : setNewSkill({...newSkill, order: parseInt(e.target.value)})
                      }
                      placeholder="Order position"
                      className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingSkill(null);
                      }}
                      className="border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      Cancel
                    </Button>
                    <Button onClick={editingSkill ? handleUpdateSkill : handleCreateSkill}>
                      <Save className="w-4 h-4 mr-2" />
                      {editingSkill ? 'Update' : 'Add'}
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
              placeholder="Search tech skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading tech skills...</p>
          </div>
        ) : filteredSkills.length === 0 ? (
          <Card className="glass border border-primary/30">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No tech skills found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill) => {
              const IconComponent = getIconByCategory(skill.category);
              return (
                <Card key={skill._id} className="glass border border-primary/30 relative">
                  <div className="absolute -top-2 -left-2 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-10">
                    {skill.order}
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <IconComponent className="w-5 h-5 text-primary" />
                          {skill.name}
                        </CardTitle>
                        <CardDescription className="mt-1">Level: {skill.level}%</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingSkill(skill);
                            setIsDialogOpen(true);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openConfirmDialog(skill._id, 'delete')}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Proficiency</span>
                        <span>{skill.level}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full" 
                          style={{width: `${skill.level}%`}}
                        ></div>
                      </div>
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
      message="Are you sure you want to delete this tech skill? This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      variant="destructive"
    />
    </>
  );
};

export default TechSkillsManager;