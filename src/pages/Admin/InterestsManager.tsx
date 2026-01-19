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
  Heart,
  Code2,
  Database,
  Palette,
  Coffee,
  Gamepad2,
  BookOpen,
  Music
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/apiConfig';
import { reorderItemsForInsertion, reorderItemsForUpdate, reorderItemsForDeletion, reorderAllItemsContiguously } from '@/lib/orderUtils';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface Interest {
  _id: string;
  icon: string;
  label: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const InterestsManager = () => {
  const { token } = useAuth();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [filteredInterests, setFilteredInterests] = useState<Interest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInterest, setEditingInterest] = useState<Interest | null>(null);
  const [newInterest, setNewInterest] = useState({
    icon: 'Heart',
    label: '',
    order: 0
  });
  
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    id: '',
    type: ''
  });

  // Fetch interests
  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/interests`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setInterests(data);
        }
      } catch (error) {
        console.error('Error fetching interests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterests();
  }, [token]);

  // Filter interests based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredInterests(interests);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredInterests(
        interests.filter(interest => 
          interest.label.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, interests]);

  const handleCreateInterest = async () => {
    try {
      // Reorder items for insertion
      await reorderItemsForInsertion(interests, newInterest.order, '/interests', token);
      
      const response = await fetch(`${API_BASE_URL}/interests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newInterest)
      });

      if (response.ok) {
        // Refresh the list to get updated orders
        const refreshResponse = await fetch(`${API_BASE_URL}/interests`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const refreshedData = await refreshResponse.json();
        setInterests(refreshedData);
        setNewInterest({
          icon: 'Heart',
          label: '',
          order: 0
        });
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating interest:', error);
    }
  };

  const handleUpdateInterest = async () => {
    if (!editingInterest) return;

    try {
      // Reorder items for update
      await reorderItemsForUpdate(interests, editingInterest._id, editingInterest.order, '/interests', token);
      
      const response = await fetch(`${API_BASE_URL}/interests/${editingInterest._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingInterest)
      });

      if (response.ok) {
        // Refresh the list to get updated orders
        const refreshResponse = await fetch(`${API_BASE_URL}/interests`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const refreshedData = await refreshResponse.json();
        setInterests(refreshedData);
        setEditingInterest(null);
      }
    } catch (error) {
      console.error('Error updating interest:', error);
    }
  };

  const handleDeleteInterest = async (id: string) => {
    try {
      // Find the deleted item to get its order
      const deletedInterest = interests.find(interest => interest._id === id);
      if (!deletedInterest) return;
      
      // Reorder items for deletion
      await reorderItemsForDeletion(interests, deletedInterest.order, '/interests', token);
      
      const response = await fetch(`${API_BASE_URL}/interests/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Refresh the list to get updated orders
        const refreshResponse = await fetch(`${API_BASE_URL}/interests`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const refreshedData = await refreshResponse.json();
        setInterests(refreshedData);
      }
    } catch (error) {
      console.error('Error deleting interest:', error);
    }
  };

  const openConfirmDialog = (id: string, type: string) => {
    setConfirmDialog({ isOpen: true, id, type });
  };
  
  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, id: '', type: '' });
  };
  
  const confirmDelete = () => {
    handleDeleteInterest(confirmDialog.id);
    closeConfirmDialog();
  };
  
  const getIconComponent = (iconName: string) => {
    switch(iconName) {
      case 'Code2': return Code2;
      case 'Database': return Database;
      case 'Palette': return Palette;
      case 'Coffee': return Coffee;
      case 'Gamepad2': return Gamepad2;
      case 'BookOpen': return BookOpen;
      case 'Music': return Music;
      case 'Heart': return Heart;
      default: return Heart;
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Interests Manager</h1>
              <p className="text-muted-foreground">Manage your personal interests</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Interest
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border border-gray-700">
                <DialogHeader>
                  <DialogTitle>{editingInterest ? 'Edit Interest' : 'Add New Interest'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="label">Interest Label</Label>
                    <Input
                      id="label"
                      value={editingInterest ? editingInterest.label : newInterest.label}
                      onChange={(e) => 
                        editingInterest 
                          ? setEditingInterest({...editingInterest, label: e.target.value}) 
                          : setNewInterest({...newInterest, label: e.target.value})
                      }
                      placeholder="e.g., Telegram Bot Development"
                      className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="icon">Icon</Label>
                      <select
                        id="icon"
                        value={editingInterest ? editingInterest.icon : newInterest.icon}
                        onChange={(e) => 
                          editingInterest 
                            ? setEditingInterest({...editingInterest, icon: e.target.value}) 
                            : setNewInterest({...newInterest, icon: e.target.value})
                        }
                        className="w-full rounded-md border-none bg-gray-800 px-3 py-2 text-white focus:ring-0 focus:ring-offset-0"
                      >
                        <option value="Heart">Heart</option>
                        <option value="Code2">Code</option>
                        <option value="Database">Database</option>
                        <option value="Palette">Palette</option>
                        <option value="Coffee">Coffee</option>
                        <option value="Gamepad2">Gamepad</option>
                        <option value="BookOpen">Book</option>
                        <option value="Music">Music</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="order">Order</Label>
                      <Input
                        id="order"
                        type="number"
                        value={editingInterest ? editingInterest.order : newInterest.order}
                        onChange={(e) => 
                          editingInterest 
                            ? setEditingInterest({...editingInterest, order: parseInt(e.target.value)}) 
                            : setNewInterest({...newInterest, order: parseInt(e.target.value)})
                        }
                        placeholder="Order position"
                        className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingInterest(null);
                      }}
                      className="border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      Cancel
                    </Button>
                    <Button onClick={editingInterest ? handleUpdateInterest : handleCreateInterest}>
                      <Save className="w-4 h-4 mr-2" />
                      {editingInterest ? 'Update' : 'Add'}
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
              placeholder="Search interests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading interests...</p>
          </div>
        ) : filteredInterests.length === 0 ? (
          <Card className="glass border border-primary/30">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No interests found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInterests.map((interest) => {
              const IconComponent = getIconComponent(interest.icon);
              return (
                <Card key={interest._id} className="glass border border-primary/30 relative">
                  <div className="absolute -top-2 -left-2 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-10">
                    {interest.order}
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <IconComponent className="w-5 h-5 text-primary" />
                          {interest.label}
                        </CardTitle>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingInterest(interest);
                            setIsDialogOpen(true);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openConfirmDialog(interest._id, 'delete')}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
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
      message="Are you sure you want to delete this interest? This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      variant="destructive"
    />
    </>
  );
};

export default InterestsManager;
